/* eslint-disable sonarjs/cognitive-complexity */

import { readWantedLockfile } from '@pnpm/lockfile-file'
import { LockfileFile } from '@pnpm/lockfile-file/lib/write'
import { ProjectManifest } from '@pnpm/types'
import { existsSync } from 'fs'
import normalizePath from 'normalize-path'
import path from 'path'

type UpdateFunc = (
  data: Record<string, unknown>,
  dir: string,
  manifest: ProjectManifest,
) => Record<string, unknown> | Promise<Record<string, unknown> | null> | null

export default async (
  workspaceDir: string,
): Promise<Record<string, UpdateFunc>> => {
  const lockfile = await readWantedLockfile(workspaceDir, {
    ignoreIncompatible: false,
  })

  if (lockfile == null) {
    throw new Error('no lockfile found')
  }

  return {
    '.releaserc.json': (releaseRc, _dir: string, manifest) => {
      if (!manifest.name) {
        return {}
      }

      return { tagFormat: `${manifest.name}@v\${version}`, ...releaseRc }
    },
    'package.json': updatePackageJson(workspaceDir, lockfile),
    'tsconfig.json': updateTsConfig(workspaceDir, lockfile),
  }
}

function updatePackageJson(_workspaceDir: string, _lockfile: LockfileFile) {
  return (manifest: ProjectManifest, _dir: string) => {
    return {
      ...manifest,
      author: 'Philipp Busse',
    }
  }
}

function updateTsConfig(workspaceDir: string, lockfile: LockfileFile) {
  return (
    tsConfig: Record<string, unknown>,
    dir: string,
    manifest: ProjectManifest,
  ) => {
    if (tsConfig == null || manifest.name?.includes('/tsconfig')) {
      return tsConfig
    }

    const relative = normalizePath(path.relative(workspaceDir, dir))

    const importer = lockfile.importers?.[relative]

    if (!importer) {
      return tsConfig
    }

    const deps = {
      ...importer.dependencies,
      ...importer.devDependencies,
    }

    const references = Object.values(deps)
      .filter((dep) => dep.startsWith('link:'))
      .map((dep) => dep.slice('link:'.length))
      .filter((relativePath) =>
        existsSync(path.join(dir, relativePath, 'tsconfig.json')),
      )
      .map((path) => ({ path }))

    console.log(`Updating tsconfig for ${dir}: ${JSON.stringify(references)}`)

    return {
      ...tsConfig,
      ...(references && {
        references: references.sort((r1, r2) => r1.path.localeCompare(r2.path)),
      }),
    }
  }
}

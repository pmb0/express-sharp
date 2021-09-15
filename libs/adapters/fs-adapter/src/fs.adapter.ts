import { getLogger, ImageAdapter } from '@edged/core'
import { promises as fs } from 'fs'
import { join } from 'path'

export class FsAdapter implements ImageAdapter {
  private log = getLogger('adapter:fs')

  constructor(public rootPath: string) {
    this.log(`Using rootPath: ${rootPath}`)
  }

  async fetch(path: string): Promise<Buffer | undefined> {
    const imagePath = join(this.rootPath, path)
    this.log(`Fetching: ${imagePath}`)
    try {
      return await fs.readFile(imagePath)
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return undefined
      }

      throw error
    }
  }
}

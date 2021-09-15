/* eslint-disable node/no-unpublished-import */
import { Config } from '@jest/types'
import { defaults } from 'jest-config'

const config: Config.InitialOptions = {
  coveragePathIgnorePatterns: [
    ...defaults.coveragePathIgnorePatterns,
    'libs/testing',
    '.dto.ts$',
    '/dist/',
  ],
  coverageReporters: ['text', 'lcov'],
  modulePathIgnorePatterns: ['/dist/'],
  preset: 'ts-jest',
  // roots: [
  //   '<rootDir>',
  //   '<rootDir>/libs/adapters/http-adapter',
  //   '<rootDir>/libs/express-sharp/',
  // ],
  testPathIgnorePatterns: [...defaults.coveragePathIgnorePatterns, '/dist/'],
}

export default config

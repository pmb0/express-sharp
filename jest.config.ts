/* eslint-disable node/no-unpublished-import */
import baseConfig from '@edged/jest-config'
import { Config } from '@jest/types'

const config: Config.InitialOptions = {
  ...baseConfig,
  setupFiles: ['<rootDir>/libs/express-sharp/setup-jest.ts'],
}

export default config

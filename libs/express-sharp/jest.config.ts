import baseConfig from '@edged/jest-config'
import { Config } from '@jest/types'

const config: Config.InitialOptions = {
  ...baseConfig,
  setupFiles: ['./setup-jest.ts'],
}

export default config

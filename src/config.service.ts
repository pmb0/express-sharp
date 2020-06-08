import { config } from 'dotenv'
import { singleton } from 'tsyringe'
import { camelToSnake } from './util'

@singleton()
export class ConfigService {
  static GLOBAL_PREFIX = 'EXPRESS_SHARP_'

  private readonly config: { [name: string]: string | undefined } = {
    ...config().parsed,
  }

  private getConfig() {
    return { ...this.config, ...process.env }
  }

  private expand(name: string) {
    return (
      ConfigService.GLOBAL_PREFIX +
      (name.includes('.')
        ? camelToSnake(name).split('.').join('_').toUpperCase()
        : name)
    )
  }

  get(name: string, defaultValue: string): string
  get(name: string): string | undefined
  get(name: string, defaultValue?: string): string | undefined {
    const key = this.expand(name)
    const config = this.getConfig()

    return key in config ? config[key] : defaultValue
  }

  set(name: string, value: string): void {
    this.config[this.expand(name)] = value
  }
}

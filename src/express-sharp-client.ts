import { container } from 'tsyringe'
import { ImageUrl } from './image-url'
import { ConfigService } from './config.service'

export function createClient(endpoint: string, secret?: string) {
  const clientContainer = container.createChildContainer()
  clientContainer.register('endpoint', { useValue: endpoint })

  if (secret) {
    clientContainer.resolve(ConfigService).set('signedUrl.secret', secret)
  }

  return clientContainer.resolve(ImageUrl)
}

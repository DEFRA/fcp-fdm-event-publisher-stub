import { config } from '../config.js'
import { health } from '../routes/health.js'
import { messages } from '../routes/messages.js'

const isApiEnabled = config.get('api.enabled')

const apiRoutes = isApiEnabled ? [messages] : []

const router = {
  plugin: {
    name: 'router',
    register: (server, _options) => {
      server.route(
        [].concat(
          health,
          apiRoutes
        )
      )
    }
  }
}

export { router }

import { config } from '../config.js'
import { health } from '../routes/health.js'
import { simulate } from '../routes/simulate.js'

const isApiEnabled = config.get('api.enabled')

const apiRoutes = isApiEnabled ? [...simulate] : []

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

import { constants as httpConstants } from 'node:http2'
import Joi from 'joi'
import { simulateMessages } from '../simulate/messages.js'

const { HTTP_STATUS_ACCEPTED } = httpConstants

const messages = {
  method: 'POST',
  path: '/api/v1/simulate/messages',
  options: {
    description: 'Simulate messages from Single Front Door Comms',
    notes: 'Scenario and number of repetitions can be specified',
    tags: ['api', 'simulate', 'messages'],
    validate: {
      query: {
        scenario: Joi.string().allow('').description('The scenario CRN to simulate messages for. If not provided, all known scenarios will be used'),
        repetitions: Joi.number().integer().min(1).max(1000).default(1).description('The number of times to repeat the scenario')
      }
    }
  },
  handler: async (request, h) => {
    const { scenario, repetitions } = request.query

    simulateMessages({ scenario, repetitions })
      .then(summary => {
        request.logger.info(`Simulated messages summary: ${JSON.stringify(summary)}`)
      })
      .catch(err => {
        request.logger.error(`Simulate messages failed: ${err.message}`)
      })

    return h.response({ status: 'ok', message: 'Simulation started' }).code(HTTP_STATUS_ACCEPTED)
  }
}

export { messages }

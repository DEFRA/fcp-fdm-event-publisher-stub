import Joi from 'joi'
import { simulateMessages } from '../simulate/messages.js'

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
        repetitions: Joi.number().integer().min(1).max(100).default(1).description('The number of times to repeat the scenario')
      }
    }
  },
  handler: async (request, h) => {
    const { scenario, repetitions } = request.query

    const summary = await simulateMessages({ scenario, repetitions })

    return h.response({ data: { summary } })
  }
}

export { messages }

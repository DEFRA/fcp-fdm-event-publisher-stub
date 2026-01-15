import { constants as httpConstants } from 'node:http2'
import Joi from 'joi'
import { simulateEvents } from '../simulate/simulator.js'
import { createLogger } from '../common/helpers/logging/logger.js'

const { HTTP_STATUS_ACCEPTED } = httpConstants

const logger = createLogger()

const simulate = [{
  method: 'POST',
  path: '/api/v1/simulate/{category}',
  options: {
    description: 'Simulate events for a specific category (message, document, or crm)',
    notes: 'Scenario and number of repetitions can be specified',
    tags: ['api', 'simulate'],
    validate: {
      params: {
        category: Joi.string().valid('message', 'document', 'crm').required().description('The category of events to simulate')
      },
      query: {
        scenario: Joi.string().allow('').description('The scenario to simulate events for. If not provided, all scenarios for the category will be used'),
        repetitions: Joi.number().integer().min(1).max(100000).default(1).description('The number of times to repeat the scenario')
      }
    }
  },
  handler: async (request, h) => {
    const { category } = request.params
    const { scenario, repetitions } = request.query

    simulateEvents({ category, scenario, repetitions })
      .then(summary => {
        logger.info(`Simulated ${category} events summary: ${JSON.stringify(summary)}`)
      })
      .catch(err => {
        logger.error(`Simulate ${category} events failed: ${err.message}`)
      })

    return h.response({ status: 'ok', message: 'Simulation started' }).code(HTTP_STATUS_ACCEPTED)
  }
}, {
  method: 'POST',
  path: '/api/v1/simulate',
  options: {
    description: 'Simulate events for all categories',
    notes: 'Scenario and number of repetitions can be specified',
    tags: ['api', 'simulate'],
    validate: {
      query: {
        scenario: Joi.string().allow('').description('The scenario to simulate events for. If not provided, all known scenarios will be used'),
        repetitions: Joi.number().integer().min(1).max(100000).default(1).description('The number of times to repeat the scenario')
      }
    }
  },
  handler: async (request, h) => {
    const { scenario, repetitions } = request.query

    simulateEvents({ scenario, repetitions })
      .then(summary => {
        logger.info(`Simulated events summary: ${JSON.stringify(summary)}`)
      })
      .catch(err => {
        logger.error(`Simulate events failed: ${err.message}`)
      })

    return h.response({ status: 'ok', message: 'Simulation started' }).code(HTTP_STATUS_ACCEPTED)
  }
}]

export { simulate }

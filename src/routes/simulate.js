import { constants as httpConstants } from 'node:http2'
import Joi from 'joi'
import { simulateEvents } from '../simulate/simulator.js'
import { getScenario, listScenarios } from '../simulate/scenarios.js'
import { createLogger } from '../common/helpers/logging/logger.js'

const { HTTP_STATUS_OK, HTTP_STATUS_ACCEPTED, HTTP_STATUS_NOT_FOUND } = httpConstants

const logger = createLogger()

function findScenario (h, scenario) {
  try {
    const events = getScenario(scenario)
    return h.response({ scenario, events: Array.isArray(events) ? events : [events] }).code(HTTP_STATUS_OK)
  } catch (err) {
    return h.response({ status: 'error', message: err.message }).code(HTTP_STATUS_NOT_FOUND)
  }
}

const simulate = [{
  method: 'POST',
  path: '/api/v1/simulate/{category}',
  options: {
    description: 'Simulate events for a specific category (message, document, or crm)',
    notes: 'Scenario and number of repetitions can be specified',
    tags: ['api', 'simulate'],
    validate: {
      params: {
        category: Joi.string().valid('message', 'document', 'crm', 'payment', 'raw').required().description('The category of events to simulate. Use "raw" to publish a caller-supplied payload from the request body')
      },
      query: {
        scenario: Joi.string().allow('').when('$params.category', {
          is: 'raw',
          then: Joi.forbidden(),
          otherwise: Joi.optional()
        }).description('The scenario to simulate events for. If not provided, all scenarios for the category will be used. Not applicable when category is raw'),
        repetitions: Joi.number().integer().min(1).max(100000).default(1).description('The number of times to repeat the scenario')
      },
      payload: Joi.any().when('$params.category', {
        is: 'raw',
        then: Joi.object({
          data: Joi.object().required().description('Arbitrary event data. correlationId will be overwritten before publishing')
        }).unknown(true).required().description('The raw event payload to publish. Decorated with id, time, and data.correlationId before publishing'),
        otherwise: Joi.valid(null).description('A request body is not accepted for this category')
      })
    }
  },
  handler: async (request, h) => {
    const { category } = request.params
    const { scenario, repetitions } = request.query
    const rawPayload = category === 'raw' ? request.payload : undefined

    simulateEvents({ category, scenario, repetitions, rawPayload })
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
}, {
  method: 'GET',
  path: '/api/v1/simulate/{category}',
  options: {
    description: 'Query the pre-canned events for a specific category',
    notes: 'Returns the event(s) for a specific scenario, or the list of available scenarios for the category if none is specified',
    tags: ['api', 'simulate'],
    validate: {
      params: {
        category: Joi.string().valid('message', 'document', 'crm', 'payment').required().description('The category of events to query')
      },
      query: {
        scenario: Joi.string().allow('').description('The name of a specific scenario to return the pre-canned event(s) for. If not provided, the available scenarios for the category are listed')
      }
    }
  },
  handler: (request, h) => {
    const { category } = request.params
    const { scenario } = request.query

    if (scenario) {
      return findScenario(h, scenario)
    }

    const scenarios = listScenarios().filter(s => s.path.split('.').at(-1).startsWith(category))
    return h.response({ category, scenarios }).code(HTTP_STATUS_OK)
  }
}]

export { simulate }

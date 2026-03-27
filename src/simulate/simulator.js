import crypto from 'node:crypto'
import { PublishCommand, SNSClient } from '@aws-sdk/client-sns'
import { config } from '../config.js'
import { getScenario, listScenarios } from './scenarios.js'

const { sns, region, endpoint, accessKeyId, secretAccessKey } = config.get('aws')

const snsClient = new SNSClient({
  region,
  ...(endpoint && {
    endpoint,
    credentials: { accessKeyId, secretAccessKey }
  })
})

export async function simulateEvents ({ category, scenario, repetitions }) {
  const scenarios = getScenarios(category, scenario)
  let totalEvents = 0

  for (let i = 0; i < repetitions; i++) {
    for (const s of scenarios) {
      const correlationId = crypto.randomUUID()

      for (const event of s) {
        event.id = crypto.randomUUID()
        event.time = new Date().toISOString()
        event.data.correlationId = correlationId
        totalEvents++

        await snsClient.send(
          new PublishCommand({
            Message: JSON.stringify(event),
            TopicArn: sns.topicArn
          })
        )
      }
    }
  }

  return { scenarios: scenarios.length, events: totalEvents, repetitions }
}

function getScenarios (category, scenario) {
  const wrap = x => Array.isArray(x) ? x : [x]
  if (scenario) {
    return [wrap(getScenario(scenario))]
  }
  const allScenarios = listScenarios()

  // Filter scenarios by category prefix if category is provided
  const filteredScenarios = category
    ? allScenarios.filter(s => s.path.split('.').at(-1).startsWith(category))
    : allScenarios

  return filteredScenarios.map(s => wrap(getScenario(s.path)))
}

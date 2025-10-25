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

export async function simulateMessages ({ scenario, repetitions }) {
  const scenarios = getScenarios(scenario)

  for (let i = 0; i < repetitions; i++) {
    for (const s of scenarios) {
      for (const event of s) {
        event.id = crypto.randomUUID()
        event.time = new Date().toISOString()

        await snsClient.send(
          new PublishCommand({
            Message: JSON.stringify(event),
            TopicArn: sns.topicArn
          })
        )
        console.log(`Simulating event: ${event.id} - ${event.type} (Repetition ${i + 1})`)
      }
    }
  }

  return { scenarios: scenarios.length, repetitions }
}

function getScenarios (scenario) {
  if (scenario) {
    return [getScenario(scenario)]
  }

  const availableScenarios = listScenarios()
  return availableScenarios.map(s => getScenario(s.path))
}

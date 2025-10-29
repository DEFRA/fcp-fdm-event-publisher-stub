import https from 'node:https'
import crypto from 'node:crypto'
import { PublishCommand, SNSClient } from '@aws-sdk/client-sns'
import { NodeHttpHandler } from '@smithy/node-http-handler'
import { config } from '../config.js'
import { getScenario, listScenarios } from './scenarios.js'

const { sns, region, endpoint, accessKeyId, secretAccessKey } = config.get('aws')

const agent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 1000,
  maxSockets: 32,
  maxFreeSockets: 10,
  timeout: 60000
})

const snsClient = new SNSClient({
  region,
  ...(endpoint && {
    endpoint,
    credentials: { accessKeyId, secretAccessKey }
  }),
  requestHandler: new NodeHttpHandler({
    httpsAgent: agent,
    connectionTimeout: 2000,
    socketTimeout: 30000
  })
})

export async function simulateMessages ({ scenario, repetitions }) {
  const scenarios = getScenarios(scenario)
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
        console.log(`Simulating event: ${event.id} - ${event.type} (Repetition ${i + 1}, correlationId: ${correlationId})`)
      }
    }
  }

  return { scenarios: scenarios.length, events: totalEvents, repetitions }
}

function getScenarios (scenario) {
  const wrap = x => Array.isArray(x) ? x : [x]
  if (scenario) {
    return [wrap(getScenario(scenario))]
  }
  return listScenarios().map(s => wrap(getScenario(s.path)))
}

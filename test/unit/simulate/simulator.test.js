import { describe, test, expect, beforeEach, vi } from 'vitest'
import { PublishCommand } from '@aws-sdk/client-sns'

const mockSend = vi.fn()

vi.mock('@aws-sdk/client-sns', () => ({
  SNSClient: vi.fn().mockImplementation(() => ({
    send: mockSend
  })),
  PublishCommand: vi.fn()
}))

vi.mock('../../../src/simulate/scenarios.js', () => ({
  getScenario: vi.fn(),
  listScenarios: vi.fn()
}))

describe('simulator', () => {
  let simulateEvents
  let getScenario
  let listScenarios

  beforeEach(async () => {
    vi.clearAllMocks()

    const scenariosModule = await import('../../../src/simulate/scenarios.js')
    const simulatorModule = await import('../../../src/simulate/simulator.js')

    simulateEvents = simulatorModule.simulateEvents
    getScenario = scenariosModule.getScenario
    listScenarios = scenariosModule.listScenarios
  })

  test('should send events for a single scenario with single event', async () => {
    const mockEvent = {
      id: 'original-id',
      time: 'original-time',
      data: { correlationId: 'original-correlation-id', someData: 'test' }
    }

    getScenario.mockReturnValue(mockEvent)
    mockSend.mockResolvedValue({})

    const result = await simulateEvents({
      scenario: 'test-scenario',
      repetitions: 1
    })

    expect(result).toEqual({
      scenarios: 1,
      events: 1,
      repetitions: 1
    })

    expect(mockSend).toHaveBeenCalledTimes(1)
    expect(PublishCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        TopicArn: expect.any(String),
        Message: expect.stringContaining('someData')
      })
    )
  })

  test('should send multiple events for a scenario with event array', async () => {
    const mockEvents = [
      {
        id: 'id-1',
        time: 'time-1',
        data: { correlationId: 'corr-1', step: 1 }
      },
      {
        id: 'id-2',
        time: 'time-2',
        data: { correlationId: 'corr-2', step: 2 }
      }
    ]

    getScenario.mockReturnValue(mockEvents)
    mockSend.mockResolvedValue({})

    const result = await simulateEvents({
      scenario: 'multi-event-scenario',
      repetitions: 1
    })

    expect(result).toEqual({
      scenarios: 1,
      events: 2,
      repetitions: 1
    })

    expect(mockSend).toHaveBeenCalledTimes(2)
  })

  test('should generate new IDs and timestamps for each event', async () => {
    const mockEvent = {
      id: 'original-id',
      time: 'original-time',
      data: { correlationId: 'original-correlation-id' }
    }

    getScenario.mockReturnValue(mockEvent)
    mockSend.mockResolvedValue({})

    await simulateEvents({
      scenario: 'test-scenario',
      repetitions: 1
    })

    const publishCall = PublishCommand.mock.calls[0][0]
    const sentMessage = JSON.parse(publishCall.Message)

    expect(sentMessage.id).not.toBe('original-id')
    expect(sentMessage.time).not.toBe('original-time')
    expect(sentMessage.data.correlationId).not.toBe('original-correlation-id')
  })

  test('should use same correlationId for all events in a scenario', async () => {
    const mockEvents = [
      {
        id: 'id-1',
        time: 'time-1',
        data: { correlationId: 'original', step: 1 }
      },
      {
        id: 'id-2',
        time: 'time-2',
        data: { correlationId: 'original', step: 2 }
      },
      {
        id: 'id-3',
        time: 'time-3',
        data: { correlationId: 'original', step: 3 }
      }
    ]

    getScenario.mockReturnValue(mockEvents)
    mockSend.mockResolvedValue({})

    await simulateEvents({
      scenario: 'multi-step-scenario',
      repetitions: 1
    })

    const correlationIds = PublishCommand.mock.calls.map(call => {
      const message = JSON.parse(call[0].Message)
      return message.data.correlationId
    })

    // All events should have the same correlationId
    expect(new Set(correlationIds).size).toBe(1)
  })

  test('should handle multiple repetitions with different correlationIds', async () => {
    const mockEvent = {
      id: 'id',
      time: 'time',
      data: { correlationId: 'original' }
    }

    getScenario.mockReturnValue(mockEvent)
    mockSend.mockResolvedValue({})

    const result = await simulateEvents({
      scenario: 'test-scenario',
      repetitions: 3
    })

    expect(result).toEqual({
      scenarios: 1,
      events: 3,
      repetitions: 3
    })

    expect(mockSend).toHaveBeenCalledTimes(3)

    const correlationIds = PublishCommand.mock.calls.map(call => {
      const message = JSON.parse(call[0].Message)
      return message.data.correlationId
    })

    // Each repetition should have a different correlationId
    expect(new Set(correlationIds).size).toBe(3)
  })

  test('should handle category filtering', async () => {
    const mockScenarios = [
      { path: 'message/successful' },
      { path: 'message/failed' },
      { path: 'payment/successful' }
    ]

    const mockEvent = {
      id: 'id',
      time: 'time',
      data: { correlationId: 'corr' }
    }

    listScenarios.mockReturnValue(mockScenarios)
    getScenario.mockReturnValue(mockEvent)
    mockSend.mockResolvedValue({})

    const result = await simulateEvents({
      category: 'message',
      repetitions: 1
    })

    expect(result).toEqual({
      scenarios: 2,
      events: 2,
      repetitions: 1
    })

    expect(getScenario).toHaveBeenCalledTimes(2)
    expect(getScenario).toHaveBeenCalledWith('message/successful')
    expect(getScenario).toHaveBeenCalledWith('message/failed')
    expect(getScenario).not.toHaveBeenCalledWith('payment/successful')
  })

  test('should handle all scenarios when no category or scenario specified', async () => {
    const mockScenarios = [
      { path: 'scenario1' },
      { path: 'scenario2' },
      { path: 'scenario3' }
    ]

    const mockEvent = {
      id: 'id',
      time: 'time',
      data: { correlationId: 'corr' }
    }

    listScenarios.mockReturnValue(mockScenarios)
    getScenario.mockReturnValue(mockEvent)
    mockSend.mockResolvedValue({})

    const result = await simulateEvents({
      repetitions: 1
    })

    expect(result).toEqual({
      scenarios: 3,
      events: 3,
      repetitions: 1
    })

    expect(getScenario).toHaveBeenCalledTimes(3)
    expect(listScenarios).toHaveBeenCalledTimes(1)
  })

  test('should handle scenario with multiple repetitions and multiple events', async () => {
    const mockEvents = [
      {
        id: 'id-1',
        time: 'time-1',
        data: { correlationId: 'original', step: 1 }
      },
      {
        id: 'id-2',
        time: 'time-2',
        data: { correlationId: 'original', step: 2 }
      }
    ]

    getScenario.mockReturnValue(mockEvents)
    mockSend.mockResolvedValue({})

    const result = await simulateEvents({
      scenario: 'test-scenario',
      repetitions: 2
    })

    expect(result).toEqual({
      scenarios: 1,
      events: 4, // 2 events × 2 repetitions
      repetitions: 2
    })

    expect(mockSend).toHaveBeenCalledTimes(4)

    // Get correlation IDs for each pair of events
    const correlationIds = PublishCommand.mock.calls.map(call => {
      const message = JSON.parse(call[0].Message)
      return message.data.correlationId
    })

    // First two events should share one correlationId
    expect(correlationIds[0]).toBe(correlationIds[1])
    // Last two events should share a different correlationId
    expect(correlationIds[2]).toBe(correlationIds[3])
    // But the two correlationIds should be different
    expect(correlationIds[0]).not.toBe(correlationIds[2])
  })
})

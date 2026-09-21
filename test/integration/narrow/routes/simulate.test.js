import { constants as httpConstants } from 'node:http2'
import { describe, test, beforeEach, afterEach, vi, expect } from 'vitest'

const { HTTP_STATUS_OK, HTTP_STATUS_ACCEPTED, HTTP_STATUS_BAD_REQUEST, HTTP_STATUS_NOT_FOUND } = httpConstants

const mockSimulateEvents = vi.fn()

vi.mock('../../../../src/simulate/simulator.js', () => ({
  simulateEvents: mockSimulateEvents
}))

const { createServer } = await import('../../../../src/server.js')

let server

describe('simulate routes', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    mockSimulateEvents.mockResolvedValue({ scenarios: 1, events: 1, repetitions: 1 })
    server = await createServer()
    await server.initialize()
  })

  afterEach(async () => {
    await server.stop()
  })

  test('POST /api/v1/simulate/raw with a valid body should return 202 and pass the payload through', async () => {
    const payload = { data: { foo: 'bar' } }

    const response = await server.inject({
      method: 'POST',
      url: '/api/v1/simulate/raw',
      payload
    })

    expect(response.statusCode).toBe(HTTP_STATUS_ACCEPTED)
    expect(mockSimulateEvents).toHaveBeenCalledWith(
      expect.objectContaining({ category: 'raw', rawPayload: payload })
    )
  })

  test('POST /api/v1/simulate/raw with no body should return 400', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/api/v1/simulate/raw'
    })

    expect(response.statusCode).toBe(HTTP_STATUS_BAD_REQUEST)
  })

  test('POST /api/v1/simulate/raw with a body missing data should return 400', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/api/v1/simulate/raw',
      payload: { foo: 'bar' }
    })

    expect(response.statusCode).toBe(HTTP_STATUS_BAD_REQUEST)
  })

  test('POST /api/v1/simulate/raw with a scenario query param should return 400', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/api/v1/simulate/raw?scenario=foo',
      payload: { data: { foo: 'bar' } }
    })

    expect(response.statusCode).toBe(HTTP_STATUS_BAD_REQUEST)
  })

  test('POST /api/v1/simulate/payment with a body should return 400', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/api/v1/simulate/payment',
      payload: { data: {} }
    })

    expect(response.statusCode).toBe(HTTP_STATUS_BAD_REQUEST)
  })

  test('POST /api/v1/simulate/payment with no body should return 202', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/api/v1/simulate/payment'
    })

    expect(response.statusCode).toBe(HTTP_STATUS_ACCEPTED)
  })

  test('GET /api/v1/simulate/{category} with a scenario should return the pre-canned event(s)', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/api/v1/simulate/payment?scenario=single.paymentExtracted'
    })

    expect(response.statusCode).toBe(HTTP_STATUS_OK)

    const body = JSON.parse(response.payload)
    expect(body.scenario).toBe('single.paymentExtracted')
    expect(body.events).toHaveLength(1)
    expect(body.events[0].type).toBe('uk.gov.defra.ffc.pay.payment.extracted')
    expect(body.events[0].data).toBeDefined()
  })

  test('GET /api/v1/simulate/{category} with a bare scenario name should resolve it', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/api/v1/simulate/payment?scenario=paymentFullTransaction'
    })

    expect(response.statusCode).toBe(HTTP_STATUS_OK)

    const body = JSON.parse(response.payload)
    expect(body.events).toHaveLength(5)
  })

  test('GET /api/v1/simulate/{category} with an unknown scenario should return 404', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/api/v1/simulate/payment?scenario=doesNotExist'
    })

    expect(response.statusCode).toBe(HTTP_STATUS_NOT_FOUND)
  })

  test('GET /api/v1/simulate/{category} with no scenario should list scenarios for the category', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/api/v1/simulate/payment'
    })

    expect(response.statusCode).toBe(HTTP_STATUS_OK)

    const body = JSON.parse(response.payload)
    expect(body.category).toBe('payment')
    expect(body.scenarios.length).toBeGreaterThan(0)
    expect(body.scenarios.every(s => s.path.split('.').at(-1).startsWith('payment'))).toBe(true)
  })

  test('GET /api/v1/simulate/raw should return 400', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/api/v1/simulate/raw'
    })

    expect(response.statusCode).toBe(HTTP_STATUS_BAD_REQUEST)
  })
})

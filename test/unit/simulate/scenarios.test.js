import { describe, test, expect } from 'vitest'
import { getScenario, listScenarios, singleEvents, completeStreams, scenarios } from '../../../src/simulate/scenarios.js'

describe('scenarios', () => {
  describe('singleEvents', () => {
    test('should contain message events', () => {
      expect(singleEvents.messageRequest).toBeDefined()
      expect(singleEvents.messageRequest).toBeInstanceOf(Array)
      expect(singleEvents.messageRequest).toHaveLength(1)
      expect(singleEvents.messageRequest[0]).toHaveProperty('id')
      expect(singleEvents.messageRequest[0]).toHaveProperty('type')
      expect(singleEvents.messageRequest[0].type).toBe('uk.gov.fcp.sfd.notification.received')
    })

    test('should contain document events', () => {
      expect(singleEvents.documentUploaded).toBeDefined()
      expect(singleEvents.documentDeleted).toBeDefined()
      expect(singleEvents.documentUploaded).toHaveLength(1)
      expect(singleEvents.documentDeleted).toHaveLength(1)
      expect(singleEvents.documentUploaded[0]).toHaveProperty('type')
      expect(singleEvents.documentDeleted[0]).toHaveProperty('type')
    })

    test('should contain CRM events', () => {
      expect(singleEvents.crmCaseCreated).toBeDefined()
      expect(singleEvents.crmCaseUpdated).toBeDefined()
      expect(singleEvents.crmCaseCreated).toHaveLength(1)
      expect(singleEvents.crmCaseUpdated).toHaveLength(1)
      expect(singleEvents.crmCaseCreated[0]).toHaveProperty('type')
      expect(singleEvents.crmCaseUpdated[0]).toHaveProperty('type')
    })

    test('should contain payment events', () => {
      expect(singleEvents.paymentExtracted).toBeDefined()
      expect(singleEvents.paymentEnriched).toBeDefined()
      expect(singleEvents.paymentProcessed).toBeDefined()
      expect(singleEvents.paymentSubmitted).toBeDefined()
      expect(singleEvents.paymentAcknowledged).toBeDefined()
      expect(singleEvents.paymentExtracted).toHaveLength(1)
      expect(singleEvents.paymentExtracted[0]).toHaveProperty('type')
      expect(singleEvents.paymentExtracted[0]).toHaveProperty('data')
    })
  })

  describe('completeStreams', () => {
    test('should contain messageSuccessful stream with correct sequence', () => {
      expect(completeStreams.messageSuccessful).toBeDefined()
      expect(completeStreams.messageSuccessful).toHaveLength(3)
      expect(completeStreams.messageSuccessful[0].type).toBe('uk.gov.fcp.sfd.notification.received')
      expect(completeStreams.messageSuccessful[1].type).toBe('uk.gov.fcp.sfd.notification.sending')
      expect(completeStreams.messageSuccessful[2].type).toBe('uk.gov.fcp.sfd.notification.delivered')
    })

    test('should contain messageValidationFailure stream', () => {
      expect(completeStreams.messageValidationFailure).toBeDefined()
      expect(completeStreams.messageValidationFailure).toHaveLength(2)
      expect(completeStreams.messageValidationFailure[0].type).toBe('uk.gov.fcp.sfd.notification.received')
      expect(completeStreams.messageValidationFailure[1].type).toBe('uk.gov.fcp.sfd.notification.failure.validation')
    })

    test('should contain messageProviderFailure stream', () => {
      expect(completeStreams.messageProviderFailure).toBeDefined()
      expect(completeStreams.messageProviderFailure).toHaveLength(3)
      expect(completeStreams.messageProviderFailure[2].type).toBe('uk.gov.fcp.sfd.notification.failure.provider')
    })

    test('should contain messageRetrySuccess stream with 5 events', () => {
      expect(completeStreams.messageRetrySuccess).toBeDefined()
      expect(completeStreams.messageRetrySuccess).toHaveLength(5)
      expect(completeStreams.messageRetrySuccess[0].type).toBe('uk.gov.fcp.sfd.notification.received')
      expect(completeStreams.messageRetrySuccess[1].type).toBe('uk.gov.fcp.sfd.notification.failure.internal')
      expect(completeStreams.messageRetrySuccess[2].type).toBe('uk.gov.fcp.sfd.notification.retry')
      expect(completeStreams.messageRetrySuccess[3].type).toBe('uk.gov.fcp.sfd.notification.sending')
      expect(completeStreams.messageRetrySuccess[4].type).toBe('uk.gov.fcp.sfd.notification.delivered')
    })

    test('should contain documentUploadedAndDeleted stream', () => {
      expect(completeStreams.documentUploadedAndDeleted).toBeDefined()
      expect(completeStreams.documentUploadedAndDeleted).toHaveLength(2)
      expect(completeStreams.documentUploadedAndDeleted[0]).toHaveProperty('type')
      expect(completeStreams.documentUploadedAndDeleted[1]).toHaveProperty('type')
    })

    test('should contain crmCaseCreatedAndUpdated stream', () => {
      expect(completeStreams.crmCaseCreatedAndUpdated).toBeDefined()
      expect(completeStreams.crmCaseCreatedAndUpdated).toHaveLength(2)
      expect(completeStreams.crmCaseCreatedAndUpdated[0]).toHaveProperty('type')
      expect(completeStreams.crmCaseCreatedAndUpdated[1]).toHaveProperty('type')
    })

    test('should contain paymentFullTransaction stream with all 5 events', () => {
      expect(completeStreams.paymentFullTransaction).toBeDefined()
      expect(completeStreams.paymentFullTransaction).toHaveLength(5)
      expect(completeStreams.paymentFullTransaction[0]).toHaveProperty('type')
      expect(completeStreams.paymentFullTransaction[1]).toHaveProperty('type')
      expect(completeStreams.paymentFullTransaction[2]).toHaveProperty('type')
      expect(completeStreams.paymentFullTransaction[3]).toHaveProperty('type')
      expect(completeStreams.paymentFullTransaction[4]).toHaveProperty('type')
      // Verify they all have data property
      completeStreams.paymentFullTransaction.forEach(event => {
        expect(event).toHaveProperty('data')
        expect(event).toHaveProperty('id')
      })
    })
  })

  describe('scenarios object', () => {
    test('should have single and streams properties', () => {
      expect(scenarios).toHaveProperty('single')
      expect(scenarios).toHaveProperty('streams')
    })

    test('should reference singleEvents and completeStreams', () => {
      expect(scenarios.single).toBe(singleEvents)
      expect(scenarios.streams).toBe(completeStreams)
    })
  })

  describe('getScenario', () => {
    test('should retrieve a single event scenario', () => {
      const scenario = getScenario('single.messageRequest')
      expect(scenario).toBeDefined()
      expect(scenario).toBeInstanceOf(Array)
      expect(scenario).toHaveLength(1)
      expect(scenario[0]).toHaveProperty('type')
      expect(scenario[0]).toHaveProperty('id')
    })

    test('should retrieve a stream scenario', () => {
      const scenario = getScenario('streams.messageSuccessful')
      expect(scenario).toBeDefined()
      expect(scenario).toBeInstanceOf(Array)
      expect(scenario).toHaveLength(3)
    })

    test('should retrieve payment single event', () => {
      const scenario = getScenario('single.paymentExtracted')
      expect(scenario).toBeDefined()
      expect(scenario[0]).toHaveProperty('type')
      expect(scenario[0]).toHaveProperty('data')
    })

    test('should retrieve payment full transaction stream', () => {
      const scenario = getScenario('streams.paymentFullTransaction')
      expect(scenario).toBeDefined()
      expect(scenario).toHaveLength(5)
      expect(scenario[0]).toHaveProperty('type')
      expect(scenario[4]).toHaveProperty('type')
    })

    test('should navigate deep paths', () => {
      const scenario = getScenario('single.crmCaseCreated')
      expect(scenario).toBeDefined()
      expect(scenario[0]).toHaveProperty('type')
    })

    test('should throw error for non-existent scenario', () => {
      expect(() => getScenario('single.nonExistent')).toThrow('Scenario not found: single.nonExistent')
    })

    test('should throw error for invalid path', () => {
      expect(() => getScenario('invalid.path.to.scenario')).toThrow('Scenario not found: invalid.path.to.scenario')
    })

    test('should handle single level paths', () => {
      const scenario = getScenario('single')
      expect(scenario).toBeDefined()
      expect(scenario).toBe(singleEvents)
    })
  })

  describe('listScenarios', () => {
    test('should return an array of scenarios', () => {
      const list = listScenarios()
      expect(list).toBeInstanceOf(Array)
      expect(list.length).toBeGreaterThan(0)
    })

    test('should return scenarios with path and count', () => {
      const list = listScenarios()
      const firstScenario = list[0]
      expect(firstScenario).toHaveProperty('path')
      expect(firstScenario).toHaveProperty('count')
      expect(typeof firstScenario.path).toBe('string')
      expect(typeof firstScenario.count).toBe('number')
    })

    test('should include single event scenarios', () => {
      const list = listScenarios()
      const messageRequest = list.find(s => s.path === 'single.messageRequest')
      expect(messageRequest).toBeDefined()
      expect(messageRequest.count).toBe(1)
    })

    test('should include stream scenarios', () => {
      const list = listScenarios()
      const messageSuccessful = list.find(s => s.path === 'streams.messageSuccessful')
      expect(messageSuccessful).toBeDefined()
      expect(messageSuccessful.count).toBe(3)
    })

    test('should include payment scenarios', () => {
      const list = listScenarios()
      const paymentExtracted = list.find(s => s.path === 'single.paymentExtracted')
      const paymentFullTransaction = list.find(s => s.path === 'streams.paymentFullTransaction')

      expect(paymentExtracted).toBeDefined()
      expect(paymentExtracted.count).toBe(1)
      expect(paymentFullTransaction).toBeDefined()
      expect(paymentFullTransaction.count).toBe(5)
    })

    test('should include CRM scenarios', () => {
      const list = listScenarios()
      const crmCreated = list.find(s => s.path === 'single.crmCaseCreated')
      const crmStream = list.find(s => s.path === 'streams.crmCaseCreatedAndUpdated')

      expect(crmCreated).toBeDefined()
      expect(crmStream).toBeDefined()
      expect(crmStream.count).toBe(2)
    })

    test('should include document scenarios', () => {
      const list = listScenarios()
      const docUploaded = list.find(s => s.path === 'single.documentUploaded')
      const docStream = list.find(s => s.path === 'streams.documentUploadedAndDeleted')

      expect(docUploaded).toBeDefined()
      expect(docStream).toBeDefined()
      expect(docStream.count).toBe(2)
    })

    test('should have correct counts for multi-event streams', () => {
      const list = listScenarios()
      const retrySuccess = list.find(s => s.path === 'streams.messageRetrySuccess')
      expect(retrySuccess).toBeDefined()
      expect(retrySuccess.count).toBe(5)
    })

    test('should list all scenario paths with proper structure', () => {
      const list = listScenarios()

      // Verify all paths are properly formatted
      list.forEach(scenario => {
        expect(scenario.path).toMatch(/^(single|streams)\..+/)
        expect(scenario.count).toBeGreaterThan(0)
      })
    })
  })
})

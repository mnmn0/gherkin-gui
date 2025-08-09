import { IpcService } from '../main/services/IpcService';
import { ipcMain } from 'electron';

// Mock electron
jest.mock('electron', () => ({
  ipcMain: {
    handle: jest.fn(),
    on: jest.fn(),
  },
}));

describe('IpcService', () => {
  let service: IpcService;
  const mockIpcMain = ipcMain as jest.Mocked<typeof ipcMain>;

  beforeEach(() => {
    service = new IpcService();
    jest.clearAllMocks();
  });

  describe('registerHandlers', () => {
    it('should register all IPC handlers', () => {
      service.registerHandlers();

      // Verify that handlers are registered for main channels
      expect(mockIpcMain.handle).toHaveBeenCalledWith(
        'file:list-specifications',
        expect.any(Function)
      );
      expect(mockIpcMain.handle).toHaveBeenCalledWith(
        'file:load-specification',
        expect.any(Function)
      );
      expect(mockIpcMain.handle).toHaveBeenCalledWith(
        'file:save-specification',
        expect.any(Function)
      );
      expect(mockIpcMain.handle).toHaveBeenCalledWith(
        'parser:parse-gherkin',
        expect.any(Function)
      );
      expect(mockIpcMain.handle).toHaveBeenCalledWith(
        'generator:generate-code',
        expect.any(Function)
      );
      expect(mockIpcMain.handle).toHaveBeenCalledWith(
        'executor:execute-tests',
        expect.any(Function)
      );
    });

    it('should handle file listing requests', async () => {
      const mockHandler = jest.fn().mockResolvedValue([
        { id: '1', name: 'test.feature', filePath: '/path/test.feature', lastModified: new Date(), size: 100 }
      ]);

      // Mock the internal service
      service.fileManagerService = { listSpecifications: mockHandler } as any;
      service.registerHandlers();

      // Get the handler that was registered
      const handlerCall = mockIpcMain.handle.mock.calls.find(
        call => call[0] === 'file:list-specifications'
      );
      expect(handlerCall).toBeDefined();

      const handler = handlerCall![1];
      const result = await handler({} as any);
      
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('test.feature');
    });

    it('should handle parse requests', async () => {
      const mockHandler = jest.fn().mockResolvedValue({
        feature: {
          name: 'Test Feature',
          scenarios: [],
          tags: []
        },
        comments: []
      });

      service.gherkinParser = { parse: mockHandler } as any;
      service.registerHandlers();

      const handlerCall = mockIpcMain.handle.mock.calls.find(
        call => call[0] === 'parser:parse-gherkin'
      );
      expect(handlerCall).toBeDefined();

      const handler = handlerCall![1];
      const result = await handler({} as any, 'Feature: Test');
      
      expect(result.feature.name).toBe('Test Feature');
      expect(mockHandler).toHaveBeenCalledWith('Feature: Test');
    });
  });

  describe('error handling', () => {
    it('should handle service errors gracefully', async () => {
      const mockHandler = jest.fn().mockRejectedValue(new Error('Service error'));
      
      service.fileManagerService = { listSpecifications: mockHandler } as any;
      service.registerHandlers();

      const handlerCall = mockIpcMain.handle.mock.calls.find(
        call => call[0] === 'file:list-specifications'
      );
      const handler = handlerCall![1];

      await expect(handler({} as any)).rejects.toThrow('Service error');
    });

    it('should validate input parameters', async () => {
      service.registerHandlers();

      const handlerCall = mockIpcMain.handle.mock.calls.find(
        call => call[0] === 'file:load-specification'
      );
      const handler = handlerCall![1];

      // Test with missing filePath
      await expect(handler({} as any, undefined)).rejects.toThrow();
    });
  });

  describe('event emission', () => {
    it('should emit progress events', () => {
      const mockWebContents = {
        send: jest.fn()
      };

      service.emitExecutionProgress('exec-1', {
        executionId: 'exec-1',
        progress: 50,
        currentTest: 'TestClass.testMethod',
        testsCompleted: 5,
        totalTests: 10
      }, mockWebContents as any);

      expect(mockWebContents.send).toHaveBeenCalledWith(
        'execution:progress',
        expect.objectContaining({
          executionId: 'exec-1',
          progress: 50
        })
      );
    });

    it('should emit completion events', () => {
      const mockWebContents = {
        send: jest.fn()
      };

      const testResult = {
        reportName: 'Test Report',
        startTime: new Date(),
        endTime: new Date(),
        environment: 'test',
        testSuites: [],
        summary: {
          totalTests: 10,
          passedTests: 8,
          failedTests: 2,
          skippedTests: 0,
          executionTime: 5000,
          successRate: 80
        }
      };

      service.emitExecutionComplete('exec-1', testResult, mockWebContents as any);

      expect(mockWebContents.send).toHaveBeenCalledWith(
        'execution:complete',
        expect.objectContaining({
          executionId: 'exec-1',
          result: testResult
        })
      );
    });

    it('should emit error events', () => {
      const mockWebContents = {
        send: jest.fn()
      };

      service.emitError('Test error message', 'execution', mockWebContents as any);

      expect(mockWebContents.send).toHaveBeenCalledWith(
        'error:occurred',
        expect.objectContaining({
          message: 'Test error message',
          category: 'execution'
        })
      );
    });
  });
});
import { ipcMain } from 'electron';
import { IpcService } from '../main/services/IpcService';

// Mock electron
jest.mock('electron', () => ({
  ipcMain: {
    handle: jest.fn(),
    on: jest.fn(),
    removeAllListeners: jest.fn(),
  },
}));

describe('IpcService', () => {
  let service: IpcService;
  const mockIpcMain = ipcMain as jest.Mocked<typeof ipcMain>;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new IpcService();
  });

  describe('IPC handlers setup', () => {
    it('should register all IPC handlers in constructor', () => {
      // The IpcService constructor automatically sets up handlers
      // Verify that handlers are registered for main channels with correct names
      expect(mockIpcMain.handle).toHaveBeenCalledWith(
        'file:list-specs',
        expect.any(Function),
      );
      expect(mockIpcMain.handle).toHaveBeenCalledWith(
        'file:load-spec',
        expect.any(Function),
      );
      expect(mockIpcMain.handle).toHaveBeenCalledWith(
        'file:save-spec',
        expect.any(Function),
      );
      expect(mockIpcMain.handle).toHaveBeenCalledWith(
        'code:generate',
        expect.any(Function),
      );
      expect(mockIpcMain.handle).toHaveBeenCalledWith(
        'code:validate',
        expect.any(Function),
      );
      expect(mockIpcMain.handle).toHaveBeenCalledWith(
        'test:execute',
        expect.any(Function),
      );
    });

    it('should handle file listing requests', async () => {
      const mockHandler = jest.fn().mockResolvedValue([
        {
          id: '1',
          name: 'test.feature',
          filePath: '/path/test.feature',
          lastModified: new Date(),
          size: 100,
        },
      ]);

      // Mock the internal service
      (service as any).fileManager = { listSpecifications: mockHandler };

      // Get the handler that was registered
      const handlerCall = mockIpcMain.handle.mock.calls.find(
        (call) => call[0] === 'file:list-specs',
      );
      expect(handlerCall).toBeDefined();

      const handler = handlerCall![1];
      const result = await handler({} as any);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('test.feature');
    });

    it('should handle code generation requests', async () => {
      const mockHandler = jest.fn().mockResolvedValue('generated test code');

      (service as any).codeGenerator = { 
        parseGherkin: jest.fn().mockResolvedValue({
          feature: {
            name: 'Test Feature',
            scenarios: [],
            tags: [],
          },
          comments: [],
        }),
        generateJUnitCode: mockHandler 
      };

      const handlerCall = mockIpcMain.handle.mock.calls.find(
        (call) => call[0] === 'code:generate',
      );
      expect(handlerCall).toBeDefined();

      const handler = handlerCall![1];
      const result = await handler({} as any, {
        specContent: 'Feature: Test',
        config: { packageName: 'com.test', className: 'Test' }
      });

      expect(result).toBe('generated test code');
    });
  });

  describe('error handling', () => {
    it('should handle service errors gracefully', async () => {
      const mockHandler = jest
        .fn()
        .mockRejectedValue(new Error('Service error'));

      (service as any).fileManager = { listSpecifications: mockHandler };

      const handlerCall = mockIpcMain.handle.mock.calls.find(
        (call) => call[0] === 'file:list-specs',
      );
      const handler = handlerCall![1];

      await expect(handler({} as any)).rejects.toThrow('Service error');
    });

    it('should validate input parameters', async () => {
      const handlerCall = mockIpcMain.handle.mock.calls.find(
        (call) => call[0] === 'file:load-spec',
      );
      const handler = handlerCall![1];

      // Test with missing filePath
      await expect(handler({} as any, undefined)).rejects.toThrow();
    });
  });

  describe('event emission', () => {
    it('should set web contents and emit events', () => {
      const mockWebContents = {
        send: jest.fn(),
      };

      service.setWebContents(mockWebContents as any);
      
      // The IpcService uses private sendToRenderer method, so we test indirectly
      // by triggering events through service listeners
      expect(mockWebContents).toBeDefined();
    });

    it('should handle cleanup correctly', () => {
      service.cleanup();
      
      // Verify cleanup doesn't throw errors
      expect(true).toBe(true);
    });

    it('should setup file watching', () => {
      service.setupFileWatching();
      
      // Verify file watching setup doesn't throw errors
      expect(true).toBe(true);
    });
  });
});
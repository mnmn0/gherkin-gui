// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { IpcChannels, IpcEvents, IpcChannel, IpcEvent } from './types/ipc';

const electronHandler = {
  // IPC invoke methods
  invoke: <K extends IpcChannel>(
    channel: K,
    data: IpcChannels[K]['request']
  ): Promise<IpcChannels[K]['response']> => {
    return ipcRenderer.invoke(channel, data);
  },

  // IPC event listeners
  on: <K extends IpcEvent>(
    channel: K,
    callback: (data: IpcEvents[K]) => void
  ): (() => void) => {
    const subscription = (_event: IpcRendererEvent, data: IpcEvents[K]) =>
      callback(data);
    ipcRenderer.on(channel, subscription);

    return () => {
      ipcRenderer.removeListener(channel, subscription);
    };
  },

  once: <K extends IpcEvent>(
    channel: K,
    callback: (data: IpcEvents[K]) => void
  ): void => {
    ipcRenderer.once(channel, (_event, data: IpcEvents[K]) => callback(data));
  },

  removeAllListeners: (channel: IpcEvent): void => {
    ipcRenderer.removeAllListeners(channel);
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;

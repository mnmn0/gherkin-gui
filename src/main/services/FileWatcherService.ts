import * as fs from 'fs';
import * as path from 'path';
import { EventEmitter } from 'events';

export interface FileChangeEvent {
  filePath: string;
  changeType: 'created' | 'modified' | 'deleted';
  timestamp: Date;
}

export class FileWatcherService extends EventEmitter {
  private watchers: Map<string, fs.FSWatcher> = new Map();
  private fileStates: Map<string, fs.Stats> = new Map();
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private debounceMs = 500;

  watchDirectory(dirPath: string): void {
    if (this.watchers.has(dirPath)) {
      return;
    }

    try {
      const watcher = fs.watch(dirPath, { recursive: false }, (eventType, filename) => {
        if (filename) {
          this.handleFileChange(path.join(dirPath, filename), eventType);
        }
      });

      this.watchers.set(dirPath, watcher);
      this.scanDirectory(dirPath);

      watcher.on('error', (error) => {
        console.error(`Watcher error for ${dirPath}:`, error);
        this.unwatchDirectory(dirPath);
      });
    } catch (error) {
      console.error(`Failed to watch directory ${dirPath}:`, error);
    }
  }

  unwatchDirectory(dirPath: string): void {
    const watcher = this.watchers.get(dirPath);
    if (watcher) {
      watcher.close();
      this.watchers.delete(dirPath);
    }

    for (const [filePath] of this.fileStates) {
      if (filePath.startsWith(dirPath)) {
        this.fileStates.delete(filePath);
      }
    }
  }

  unwatchAll(): void {
    for (const [dirPath] of this.watchers) {
      this.unwatchDirectory(dirPath);
    }

    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();
  }

  private handleFileChange(filePath: string, eventType: string): void {
    const existingTimer = this.debounceTimers.get(filePath);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(() => {
      this.processFileChange(filePath);
      this.debounceTimers.delete(filePath);
    }, this.debounceMs);

    this.debounceTimers.set(filePath, timer);
  }

  private processFileChange(filePath: string): void {
    try {
      const exists = fs.existsSync(filePath);
      const previousState = this.fileStates.get(filePath);

      if (!exists && previousState) {
        this.fileStates.delete(filePath);
        this.emitChange(filePath, 'deleted');
      } else if (exists) {
        const currentState = fs.statSync(filePath);
        
        if (!previousState) {
          this.fileStates.set(filePath, currentState);
          this.emitChange(filePath, 'created');
        } else if (currentState.mtime.getTime() !== previousState.mtime.getTime()) {
          this.fileStates.set(filePath, currentState);
          this.emitChange(filePath, 'modified');
        }
      }
    } catch (error) {
      console.error(`Error processing file change for ${filePath}:`, error);
    }
  }

  private scanDirectory(dirPath: string): void {
    try {
      const files = fs.readdirSync(dirPath);
      
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        
        try {
          const stats = fs.statSync(filePath);
          if (stats.isFile()) {
            this.fileStates.set(filePath, stats);
          }
        } catch (error) {
          console.error(`Failed to stat file ${filePath}:`, error);
        }
      }
    } catch (error) {
      console.error(`Failed to scan directory ${dirPath}:`, error);
    }
  }

  private emitChange(filePath: string, changeType: 'created' | 'modified' | 'deleted'): void {
    const event: FileChangeEvent = {
      filePath,
      changeType,
      timestamp: new Date(),
    };

    this.emit('file-changed', event);
  }

  getWatchedDirectories(): string[] {
    return Array.from(this.watchers.keys());
  }

  isWatching(dirPath: string): boolean {
    return this.watchers.has(dirPath);
  }
}
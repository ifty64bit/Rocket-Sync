/// <reference types="vite/client" />
/// <reference types="react" />

interface SignalAPI {
  sayHello: (arg: string) => Promise<string>;
  getDevices: (arg: string) => Promise<string>;
  openFolder: () => Promise<string>;
  getAllinPath: (arg: string) => Promise<string[]>;
  sendFile: (arg: { path: string; fileName: string }) => Promise<string>;
  pullFile: (arg: { fileName: string; path: string }) => Promise<string>;
  get: (arg: string) => Promise<string>;
  onProgress: (
    callback: (data: { fileName: string; progress: number }) => void,
  ) => void;
}

declare global {
  interface Window {
    signal: SignalAPI;
  }
}

export {};

import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";

const api = {
  sayHello: (arg: string) => ipcRenderer.invoke("say-hello", arg),
  getDevices: (arg: string) => ipcRenderer.invoke("getDevices", arg),
  openFolder: () => ipcRenderer.invoke("openFolder"),
  getAllinPath: (arg: string) => ipcRenderer.invoke("getAllinPath", arg),
  sendFile: (arg: { path: string; fileName: string }) =>
    ipcRenderer.invoke("sendFile", arg),
  pullFile: (arg: { fileName: string; path: string }) =>
    ipcRenderer.invoke("pullFile", arg),
  get: (arg: string) => ipcRenderer.invoke("get", arg),
  onProgress: (
    callback: (data: { fileName: string; progress: number }) => void,
  ) => {
    ipcRenderer.on("transfer-progress", (_, data) => callback(data));
  },
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);
    contextBridge.exposeInMainWorld("signal", api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.signal = api;
}

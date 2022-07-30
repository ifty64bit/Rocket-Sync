const { ipcRenderer, contextBridge } = require("electron");
const { platform } = require("os"); 

// can be accessed through window
contextBridge.exposeInMainWorld('signal', { 
    sayHello: (arg) => ipcRenderer.invoke("say-hello", arg),
    getDevices: (arg) => ipcRenderer.invoke("getDevices", arg),
    openFolder : (arg)=>ipcRenderer.invoke("openFolder", arg),
    getAllinPath: (arg) => ipcRenderer.invoke("getAllinPath", arg),
    sendFile: (arg) => ipcRenderer.invoke('sendFile', arg),
    pullFile: (arg) => ipcRenderer.invoke('pullFile', arg),
    get : (arg)=> ipcRenderer.invoke('get',arg)
} 
) 

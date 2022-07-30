const { app, BrowserWindow, dialog } = require('electron');
const { execSync } = require("child_process");
const { ipcMain } = require('electron/main');
const path = require('path');

function createWindow () {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), 
    }
  })

  //load the index.html from a url
  win.loadURL('http://localhost:3000');

  // Open the DevTools.
  win.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})


ipcMain.handle("say-hello", async (event, args) => {
  console.log(args);
  return "Hello From Main Process"
})

ipcMain.handle("getDevices", async (event, arg) => {
  try {
    return execSync(path.join(__dirname, arg)).toString();
  } catch (error) {
    return error.message.split(':')[3];
  }
})

ipcMain.handle("openFolder", (event, arg) => {
  return dialog.showOpenDialogSync({
    properties: ['openDirectory',],
    //defaultPath: "Desktop"
  })[0];
})

ipcMain.handle("getAllinPath", (event, arg) => {
  return execSync(`dir "${arg}" /b`).toString().split("\r\n");
})

ipcMain.handle('sendFile', async (event, arg) => {
  return execSync(`${__dirname}\\adb\\adb.exe push "${arg.path}\\${arg.fileName}" /sdcard`).toString();
})

ipcMain.handle('get', async (event, arg) => {
  return execSync(`${__dirname}\\adb\\adb.exe ${arg}`).toString();
})

ipcMain.handle('pullFile', async (event, arg) => {
  return execSync(`${__dirname}\\adb\\adb.exe pull sdcard/${arg.fileName} ${arg.path}`).toString();
})
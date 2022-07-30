const { app, BrowserWindow, dialog } = require('electron');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { ipcMain } = require('electron/main');
const path = require('path');
const url = require('url');

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    }
  })

  win.setTitle("Rocket Sync")

  win.setMenu(null);

  //load the index.html from a url
  win.loadURL(
    url.format({
      pathname: path.join(__dirname, '..', 'build', "index.html"),
      protocol: "file:",
      slashes: true
    })
    //'http://localhost:3000'
  );

  // Open the DevTools.
  //win.webContents.openDevTools()
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
    const { stdout } = await exec(`${path.join(__dirname, '..', '..')}\\app.asar.unpacked\\build\\adb\\adb.exe ${arg}`);
    return stdout;
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

ipcMain.handle("getAllinPath", async (event, arg) => {
  const { stdout } = await exec(`dir "${arg}" /b`);
  return stdout.split("\r\n");
})

ipcMain.handle('sendFile', async (event, arg) => {
  const { stdout } = await exec(`${path.join(__dirname, '..', '..')}\\app.asar.unpacked\\build\\adb\\adb.exe push "${arg.path}\\${arg.fileName}" /sdcard`);
  return stdout;
})


ipcMain.handle('get', async (event, arg) => {
  const { stdout } = await exec(`${path.join(__dirname, '..', '..')}\\app.asar.unpacked\\build\\adb\\adb.exe ${arg}`);
  return stdout
})

ipcMain.handle('pullFile', async (event, arg) => {
  const { stdout } = await exec(`${path.join(__dirname, '..', '..')}\\app.asar.unpacked\\build\\adb\\adb.exe pull "sdcard/${arg.fileName}" "${arg.path}"`);
  return stdout;
})
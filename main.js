const electron = require('electron');
const url	   = require('url');
const path 	   = require('path');
const ioHook   = require('iohook');
const { app, BrowserWindow, ipcMain } = electron

let mainWindow;

app.on('ready', function() {
	const { screen } = electron
	mainWindow = new BrowserWindow({
		transparent: true, frame: false, skipTaskbar: true, alwaysOnTop: true
	});

	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'main.html'),
		protocol: 'file', slashes: true
	}));

	mainWindow.webContents.on('dom-ready', () => {
		var active = false;
		// Show window when key is pressed
		ioHook.on('keydown', (event) => {
			// Keycode 15 = TAB
			if (event.keycode == 15 && !active) {
				// Send the wheel data to the UI
				mainWindow.webContents.send(
					"window:show", 
					["Option 1", "Option 2", "Option 3", "Option 4", "Option 5", "Option 6"], 
					screen.getCursorScreenPoint(), 
					mainWindow.getBounds()
				);
				mainWindow.setIgnoreMouseEvents(false);
				// Keep the wheel from refreshing when the key is held down
				active = true;
			}
		});
		// Hide the screen after the key is released
		ioHook.on('keyup', (event) => {
			if (event.keycode == 15) {	
				mainWindow.webContents.send("window:hide");
				mainWindow.setIgnoreMouseEvents(true, false);
				// Deactivate the window
				active = false;
			}
		});
		// Start ioHook
		ioHook.start();
		// Triggered when a window is hidden from the UI side
		ipcMain.on('window:hidden', () => {
			mainWindow.setIgnoreMouseEvents(true, false);
			visible = false
		});
	});

	mainWindow.maximize();
	mainWindow.show();
	// mainWindow.webContents.openDevTools();
});

// TODO Detecting the last hovered element and executing the command associated to it
// TODO Multi-monitor support
// TODO Edge detection (prevent the wheel from going outside the window by changing the wheel style)
// TODO Program detection and keybind/macro config
// TODO Settings window
// TODO show application specific pie menu with macros
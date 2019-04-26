const electron  = require('electron');
const url	    = require('url');
const path 	    = require('path');
const ioHook    = require('iohook');
const windows   = require('./windows');
const { app, BrowserWindow, ipcMain } = electron

let wheelWindow;

app.on('ready', function() {
	wheelWindow = new BrowserWindow({
		transparent: true, frame: false, skipTaskbar: true, alwaysOnTop: true
	});

	wheelWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'render/wheel.html'),
		protocol: 'file', slashes: true
	}));

	wheelWindow.webContents.on('dom-ready', () => {
		const { screen } = electron;
		var active = false;
		// Show window when key is pressed
		ioHook.on('keydown', (event) => {			
			// Keycode 15 = TAB
			if (event.keycode == 15 && !active) {
				windows.setProgram();
				var display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());	
				// Move window to active screen	
				wheelWindow.setPosition(display.workArea.x, display.workArea.y);
				wheelWindow.maximize();
				// Send the wheel data to the UI
				wheelWindow.webContents.send(	
					"window:show", ["Option 1", "Option 2", "Option 3", "Option 4", "Option 5", "Option 6"], 
					screen.getCursorScreenPoint(), display
				);	
				wheelWindow.setIgnoreMouseEvents(false);		
				wheelWindow.minimize();
				wheelWindow.focus();
				// Keep the wheel from refreshing when the key is held down	
				active = true;	
			}		
		});	

		// Hide the screen after the key is released
		ioHook.on('keyup', (event) => {
			if (event.keycode == 15) {
				wheelWindow.webContents.send("window:hide");
				wheelWindow.setIgnoreMouseEvents(true, false);	
				// Deactivate the window	
				active = false;
				windows.setTop();
			}		
		});
		// Start ioHook	
		ioHook.start();
		// Triggered when a window is hidden from the UI side
		ipcMain.on('window:hidden', () => {
			wheelWindow.setIgnoreMouseEvents(true, false);
			windows.setTop();
		});
	});

	wheelWindow.setIgnoreMouseEvents(true, false);
	wheelWindow.maximize();
	wheelWindow.show();
	// wheelWindow.webContents.openDevTools();	
});

// TODO Detecting the last hovered element and executing the command associated to it	
// TODO Program detection and keybind/macro config
// TODO Settings window
// TODO show application specific pie menu with macros						
// TODO prevent text input spam when window is visible (fixed mostly)		
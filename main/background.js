import { join } from 'path';
import { app, screen, shell } from 'electron';
import { createWindow, exitOnChange } from './helpers';
import PackageManagement from './packageManagement';

const isProd = process.env.NODE_ENV === 'production';

if (!isProd) {
	exitOnChange();

	const userDataPath = app.getPath('userData');
	app.setPath('userData', `${userDataPath} (development)`);
}

app.commandLine.appendSwitch('remote-debugging-port', '8315');
app.commandLine.appendSwitch('host-rules', 'MAP * 127.0.0.1');

app.on('ready', () => {
	const cursorPos = screen.getCursorScreenPoint();
	const currentScreen = screen.getDisplayNearestPoint(cursorPos);

	const mainWindow = createWindow('main', {
		titleBarStyle: 'hiddenInset',
		width: Math.min(1200, currentScreen.size.width * 0.7),
		height: currentScreen.size.height * 0.75
	});

	mainWindow.setMinimumSize(600, 400);

	const packageManagement = new PackageManagement(mainWindow);

	if (isProd) {
		const homeFile = join(app.getAppPath(), 'app/startup/index.html');
		mainWindow.loadFile(homeFile);
		mainWindow.webContents.openDevTools();
	} else {
		const homeUrl = 'http://localhost:8888/startup';
		mainWindow.loadURL(homeUrl);
		mainWindow.webContents.openDevTools();
	}

	const handleRedirect = (e, url) => {
		if(url !== mainWindow.webContents.getURL()) {
			e.preventDefault();
			shell.openExternal(url);
		}
	};

	mainWindow.webContents.on('will-navigate', handleRedirect);
	mainWindow.webContents.on('new-window', handleRedirect);
});

app.on('window-all-closed', () => {
	app.quit();
});

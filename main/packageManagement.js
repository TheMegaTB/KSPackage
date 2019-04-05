import { ipcMain } from 'electron';
import promiseIpc from 'electron-promise-ipc';
import KSPackage, { DownloadManager, KSPInstallation, Version, ChangeSetType } from 'kspackage-lib';

function serializeMod(mod) {
	let serializedMod = Object.assign({}, mod);
	serializedMod.version = mod.version.stringRepresentation;
	return serializedMod
}

class PackageManagement {
	constructor(window) {
		this.window = window;

		ipcMain.on('startup', this.init);

		promiseIpc.on('refreshModList', () => this.kspackage.latestCompatibleModVersions());
		promiseIpc.on('searchModList', query => this.kspackage.searchForCompatibleMod(query));
		promiseIpc.on('getMod', id => serializeMod(this.kspackage.modByIdentifier(id)));
		promiseIpc.on('getEnhancedMod', async id => {
			const mod = this.kspackage.modByIdentifier(id);
			await mod.fetchEnhancedMetadata();
			return serializeMod(mod);
		});

		promiseIpc.on('dequeue', id => this.kspackage.dequeue(id));
		promiseIpc.on('queueForInstallation', id => this.kspackage.queueForInstallation(id));
		promiseIpc.on('queueForRemoval', id => this.kspackage.queueForRemoval(id));
		promiseIpc.on('getQueue', () => this.kspackage.queuedChanges);

		promiseIpc.on('modStatus', id => {
			const installed = this.kspackage.installedMods.hasOwnProperty(id);
			const queueStatus = this.kspackage.queuedChanges[id] || false;

			return { installed, queueStatus };
		});
	}

	send = (channel, data) => {
		this.window.webContents.send(channel, data);
	};

	init = () => {
		const installation = new KSPInstallation(process.env.HOME + '/Downloads/KSP', new Version('1.4.2'));
		const downloadManager = new DownloadManager();

		downloadManager.progressCallback = (loaded, total) => {
			this.window.webContents.send('startup', { type: 'progress', value: loaded / total });
		};

		KSPackage.create(installation, downloadManager)
			.then(kspackage => {
				this.kspackage = kspackage;
				this.send('startup', { type: 'initialized' });
			});
	};
}

export default PackageManagement;

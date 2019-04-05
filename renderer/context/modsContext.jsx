import React, { Component } from 'react';
import promiseIpc from 'electron-promise-ipc';

export const ModsContext = React.createContext('modContext');

export class ModsContextProvider extends Component {
	constructor(args) {
		super(args);

		this.state = {
			mods: [],
			loading: true,

			// Load mods
			loadAll: this.fetchFullModList,
			search: this.fetchModsForQuery,

			// Modify the queue
			queue: {},
			dequeue: this.dequeue,
			queueForInstallation: this.queueForInstallation,
			queueForRemoval: this.queueForRemoval,
			updateQueue: this.updateQueue
		};
	}

	updateQueue = async () => {
		const queue = await promiseIpc.send('getQueue');
		this.setState({ queue });
	};

    fetchFullModList = async () => {
    	this.setState({ loading: true });
    	const mods = await promiseIpc.send('refreshModList');
    	this.setState({ loading: false, mods });
    };

	fetchModsForQuery = async query => {
		this.setState({ loading: true });
		const mods = await promiseIpc.send('searchModList', query);
		this.setState({ loading: false, mods });
	};

	dequeue = async id => {
		await promiseIpc.send('dequeue', id);
		await this.updateQueue();
	};

	queueForInstallation = async id => {
		await promiseIpc.send('queueForInstallation', id);
		await this.updateQueue();
	};

	queueForRemoval = async id => {
		await promiseIpc.send('queueForRemoval', id);
		await this.updateQueue();
	};

	render() {
    	return (
    		<ModsContext.Provider value={this.state}>
    			{this.props.children}
    		</ModsContext.Provider>
    	);
	}
}

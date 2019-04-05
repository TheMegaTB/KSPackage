import React, { Component } from 'react';
import PropTypes from 'prop-types';
import CheckIcon from '@material-ui/icons/Check';
import AddIcon from '@material-ui/icons/Add';
import UpdateIcon from '@material-ui/icons/Update';
import DeletePendingIcon from '@material-ui/icons/DeleteSweep';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import withStyles from '@material-ui/core/styles/withStyles';
import {ModsContext} from '../../context/modsContext';
import promiseIpc from 'electron-promise-ipc';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';

const transition = {
	transitionProperty: 'color',
	transitionDuration: '250ms'
};

const styles = theme => ({
	installedIcon: {
		color: 'green',
		'&:hover': { color: 'red' },
		...transition
	},
	notInstalledIcon: {
		'&:hover': { color: theme.palette.primary.light },
		...transition
	},
	queuedIcon: {
		color: theme.palette.primary.light,
		'&:hover': { color: 'red' },
		...transition
	}
});

class ModStatusButton extends Component {
	static contextType = ModsContext;
	static propTypes = {
		id: PropTypes.string
	};

	state = {
		queued: false,
		installed: false,
		loading: true,
		error: undefined
	};

	handleClick = async () => {
		const { queued, installed, loading } = this.state;

		if (loading) return;

		this.setState({ loading: true });

		try {
			if (queued) {
				await this.context.dequeue(this.props.id);
			} else if (installed) {
				await this.context.queueForRemoval(this.props.id);
			} else {
				await this.context.queueForInstallation(this.props.id);
			}
		} catch (error) {
			this.setState({
				loading: false,
				error: error.message || error
			});
		}

		await this.refresh();
	};

	handleClose = () => {
		this.setState({
			error: undefined
		});
	};

	refresh = () => {
		// TODO Pull this from the context instead of IPC to improve performance and remove asynchronousity
		return promiseIpc.send('modStatus', this.props.id)
			.then(status => this.setState({
				loading: false,
				installed: status.installed,
				queued: Boolean(status.queueStatus)
			})).catch(err => console.error(err));
	};

	componentDidUpdate(prevProps, prevState, snapshot) {
		if (prevProps.id !== this.props.id) this.refresh();
	}

	componentDidMount() {
		this.refresh();
	}

	render() {
		const { classes } = this.props;
		const { queued, installed, loading } = this.state;

		if (loading) {
			return <IconButton><CircularProgress style={{ width: 20, height: 20 }}/></IconButton>;
		}

		let icon;
		let tooltip;

		if (installed && queued) {
			icon = <DeletePendingIcon className={classes.queuedIcon} />;
			tooltip = 'Remove from uninstall queue';
		} else if (!installed && queued) {
			icon = <UpdateIcon className={classes.queuedIcon} />;
			tooltip = 'Remove from install queue';
		} else if (installed && !queued) {
			icon = <CheckIcon className={classes.installedIcon} />;
			tooltip = 'Queue for removal';
		} else if (!installed && !queued) {
			icon = <AddIcon className={classes.notInstalledIcon} />;
			tooltip = 'Queue for installation';
		}

		return (
			<React.Fragment>
				<Tooltip title={tooltip}>
					<IconButton onClick={this.handleClick}>{icon}</IconButton>
				</Tooltip>
				<Dialog
					open={Boolean(this.state.error)}
					onClose={this.handleClose}
				>
					<DialogTitle>Unable to add mod.</DialogTitle>
					<DialogContent>
						<DialogContentText>{this.state.error}</DialogContentText>
					</DialogContent>
					<DialogActions>
						<Button onClick={this.handleClose} color="primary" autoFocus>Ok</Button>
					</DialogActions>
				</Dialog>
			</React.Fragment>
		);
	}
}

export default withStyles(styles)(ModStatusButton);
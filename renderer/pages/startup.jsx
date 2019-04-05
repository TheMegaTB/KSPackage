import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import Router from 'next/router';
import withStyles from '@material-ui/core/styles/withStyles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import LinearProgress from '@material-ui/core/LinearProgress';
import { resolve } from '../helpers';

const styles = theme => ({
	root: {
		width: '100%',
		height: '100%',
		backgroundColor: theme.palette.primary.light
	},
	title: {
		color: theme.palette.primary.dark
	},
	loader: {
		width: '25%',
		marginTop: theme.spacing.unit * 3,
		marginBottom: theme.spacing.unit
	},
	subtitle: {
		display: 'inline-block',
		color: theme.palette.text.hint
	},
	dots: {
		width: 15,
		textAlign: 'left',
		display: 'inline-block',
		color: theme.palette.text.hint
	}
});

class Startup extends Component {
	state = {
		progress: undefined,
		dots: '...'
	};

	componentWillUnmount() {
		if (this.startupListener) ipcRenderer.removeListener('startup', this.startupListener);
		clearInterval(this.dotsInterval);
	}

	componentDidMount() {
		ipcRenderer.send('startup');

		this.startupListener = ipcRenderer.on('startup', (event, arg) => {
			if (arg.type === 'progress') this.setState({ progress: arg.value * 100 });
			else if (arg.type === 'initialized') Router.push(resolve('modList'));
		});

		this.dotsInterval = setInterval(() => {
			let dots = this.state.dots + '.';
			if (dots.length > 3) dots = '.';
			this.setState({ dots });
		}, 450);
	}

	render() {
		const { classes } = this.props;
		const { progress, dots } = this.state;

		return (
			<Grid container alignItems="center" justify="center" direction="column" className={classes.root}>
				<Grid item>
					<Typography variant="h2" className={classes.title}>
						KSPackage
					</Typography>
				</Grid>
				<Grid item className={classes.loader}>
					<LinearProgress variant={progress ? 'determinate' : 'indeterminate'} value={progress} />
				</Grid>
				<Grid item>
					<Typography variant="caption" className={classes.subtitle}>
						{progress && progress === 100 ? 'Parsing metadata' : 'Fetching metadata'}
					</Typography>
					<Typography variant="caption" className={classes.dots}> {dots}</Typography>
				</Grid>
			</Grid>
		)
	}
}

export default withStyles(styles)(Startup);

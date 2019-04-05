import React, { Component } from 'react';
import Typography from '@material-ui/core/Typography';
import { ModsContext } from '../context/modsContext';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList as List } from 'react-window';
import Grid from '@material-ui/core/Grid';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import SettingsIcon from '@material-ui/icons/Settings';
import QueueIcon from '@material-ui/icons/Schedule';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import CircularProgress from '@material-ui/core/CircularProgress';
import ModDetailView from '../components/modList/ModDetailView';
import ModSearch from '../components/modList/ModSearch';
import withStyles from '@material-ui/core/styles/withStyles';
import ModStatusButton from '../components/modList/ModStatusButton';
import Badge from '@material-ui/core/Badge';

const ModRow = (mods, selectedIdentifier, onSelect) => ({ index, style }) => (
	<div style={style}>
		<ListItem
			button
			onClick={() => onSelect(mods[index].identifier)}
			selected={selectedIdentifier === mods[index].identifier}
		>
			<ListItemText
				disableTypography
				primary={
					<Typography variant="subtitle1" noWrap>{mods[index].name}</Typography>
				}
				secondary={
					<Typography
						color="textSecondary"
						variant="caption"
						noWrap
					>{mods[index].abstract}</Typography>
				}
			/>
			<ListItemSecondaryAction>
				<ModStatusButton id={mods[index].identifier} />
			</ListItemSecondaryAction>
		</ListItem>
		<Divider />
	</div>
);

const ModListRenderer = ({ mods, selectedIdentifier, onSelect }) => (
	<Grid item style={{flexGrow: 1, listStyle: 'none', WebkitAppRegion: 'no-drag'}}>
		<AutoSizer>
			{({height, width}) => (
				<List
					height={height}
					width={width}
					itemCount={mods.length}
					itemSize={69}
				>
					{ModRow(mods, selectedIdentifier, onSelect)}
				</List>
			)}
		</AutoSizer>
	</Grid>
);

const styles = theme => ({
	root: {
		width: '100%',
		height: '100%'
	},
	leftPanel: {
		height: '100%',
		borderRight: `solid 1px ${theme.palette.divider}`,
		backgroundColor: theme.palette.background.paper
	},
	header: {
		// paddingTop: 32,
		paddingLeft: 16,
		paddingRight: 16,
		paddingBottom: 16,
		boxShadow: theme.shadows[1],
		backgroundColor: theme.palette.background.default
	},
	modDetails: {
		height: '100%',
		overflow: 'hidden'
	},
	noModSelected: {
		width: '100%',
		height: '100%',
		backgroundColor: theme.palette.background.default
	}
});

class ModList extends Component {
	static contextType = ModsContext;

	state = {
		selectedID: ''
	};

	search = query => {
		// TODO Show this error to the user.
		if (query.length === 0) {
			this.context.loadAll().catch(err => console.error(err));
		} else {
			this.context.search(query).catch(err => console.error(err));
		}
	};

	componentDidMount() {
		// TODO Show this error to the user.
		this.context.loadAll().catch(err => console.error(err));
		this.context.updateQueue();
	}

	render() {
		const { classes } = this.props;
		const { mods, loading } = this.context;
		const { selectedID } = this.state;

		const modList = (
			<ModListRenderer
				mods={mods}
				selectedIdentifier={selectedID}
				onSelect={selectedID => this.setState({ selectedID })}
			/>
		);

		const loader = (
			<Grid item container justify="center" alignItems="center" direction="column" style={{ flexGrow: 1 }}>
				<CircularProgress/>
				<Typography variant="caption" color="textSecondary" style={{ marginTop: 16 }}>Loading mods ...</Typography>
			</Grid>
		);

		return (
			<Grid container className={classes.root}>
				<Grid item xs={4} container direction="column" className={classes.leftPanel}>
					<Grid item className={classes.header}>
						<Grid container justify="flex-end" alignItems="center">
							<Grid item><IconButton>
								<Badge badgeContent={4} color="primary">
									<QueueIcon />
								</Badge>
							</IconButton></Grid>
							<Grid item><IconButton><SettingsIcon /></IconButton></Grid>
						</Grid>
						<ModSearch onSearch={this.search} />
					</Grid>
					<Divider />
					{loading ? loader : modList}
				</Grid>
				<Grid item xs={8} className={classes.modDetails}>
					{selectedID ? <ModDetailView id={selectedID} /> : (
						<Grid container alignItems="center" justify="center" className={classes.noModSelected}>
							<Grid item>
								<Typography variant="h5" color="textSecondary">No mod selected.</Typography>
							</Grid>
						</Grid>
					)}
				</Grid>
			</Grid>
		);
	}
}

export default withStyles(styles)(ModList);
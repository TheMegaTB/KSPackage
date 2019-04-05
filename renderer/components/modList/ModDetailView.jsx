import React, { Component } from 'react';
import promiseIpc from 'electron-promise-ipc';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import Interweave from 'interweave';
import PropTypes from 'prop-types';
import WarningIcon from '@material-ui/icons/Warning';
import EnhancedMetadataIcon from '@material-ui/icons/VerifiedUser';
import Tooltip from '@material-ui/core/Tooltip';
import Zoom from '@material-ui/core/Zoom';
import IconButton from '@material-ui/core/IconButton';
import WebsiteIcon from '@material-ui/icons/Public';
import RepoIcon from '@material-ui/icons/Code';
import BugTrackerIcon from '@material-ui/icons/BugReport';
import ModStatusButton from './ModStatusButton';
import {shell} from 'electron';

const CenteredLoadingIndicator = () => (
	<Grid container alignItems="center" justify="center" style={{ width: '100%', height: '100%' }}>
		<Grid item>
			<CircularProgress />
		</Grid>
	</Grid>
);

class ModDetailView extends Component {
	static propTypes = {
		id: PropTypes.string
	};

	state = {
		loading: true,
		loadingDetails: true,
		detailError: undefined,
		mod: undefined
	};

	refresh = () => {
		this.setState({ loading: true, loadingDetails: true, detailError: undefined, mod: undefined });

		const pendingModID = this.props.id;

		promiseIpc.send('getMod', pendingModID)
			.then(mod => {
				if (pendingModID === this.props.id) return this.setState({
					loading: false,
					mod
				});
			})
			.catch(err => console.error(err));

		promiseIpc.send('getEnhancedMod', pendingModID)
			.then(mod => {
				if (pendingModID === this.props.id) return this.setState({
					loading: false,
					loadingDetails: false,
					mod
				});
			})
			.catch(detailError => {
				if (pendingModID === this.props.id) return this.setState({
					loading: false,
					loadingDetails: false,
					detailError
				});
			});
	};

	nav = url => () => {
		shell.openExternal(url);
	};

	componentDidUpdate(prevProps, prevState, snapshot) {
		if (prevProps.id !== this.props.id) this.refresh();
	}

	componentDidMount() {
		this.refresh();
	}

	render() {
		const { loading, loadingDetails, detailError, mod } = this.state;

		if (loading) return <CenteredLoadingIndicator />;

		const author = mod.author.constructor === Array ? mod.author.reduce((acc, author) => acc ? `${acc}, ${author}` : author) : mod.author;

		let auxiliaryDataIndicator;

		if (loadingDetails) {
			auxiliaryDataIndicator = (
				<Tooltip title="Loading enhanced metadata" TransitionComponent={Zoom}>
					<CircularProgress style={{ width: 20, height: 20 }}/>
				</Tooltip>
			);
		} else if (detailError) {
			auxiliaryDataIndicator = (
				<Tooltip title={detailError.message || detailError} TransitionComponent={Zoom}>
					<WarningIcon style={{ color: '#ffc107', width: 20, height: 20 }} />
				</Tooltip>
			);
		} else {
			auxiliaryDataIndicator = (
				<Tooltip title="Enhanced metadata loaded" TransitionComponent={Zoom}>
					<EnhancedMetadataIcon style={{ color: '#4caf50', width: 20, height: 20 }} />
				</Tooltip>
			)
		}

		// TODO Add the following metadata:
		//  - releaseStatus (whatever that is)
		//  - tags
		//  - downloads
		//  - followers

		// TODO Add matchers for Interweave:
		//	- Resize images to object-fit cover
		//	- Open links in the browser
		//  - Search for cross references (by name/identifier) and either search for them or open the mod directly
		return (
			<div style={{ width: '100%', height: '100%', overflow: 'scroll' }}>
				<div style={{ overflow: 'hidden', backgroundColor: 'lightGray', height: 300 }}>
					<img src={mod.screenshot} style={{ objectFit: 'cover', width: '100%', height: '100%' }}/>
				</div>
				<Divider />
				<div style={{ margin: 16 }}>
					<Grid container justify="space-between" alignItems="center">
						<Grid item style={{ maxWidth: '80%' }}>
							<Grid container alignItems="center" style={{ margin: 0, width: '100%' }}>
								<Typography variant="h5" style={{ width: 'calc(100% - 38px)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mod.name}</Typography>
								<Grid item style={{ marginLeft: 8, width: 30 }}>{auxiliaryDataIndicator}</Grid>
							</Grid>
							<Typography variant="caption" color="textSecondary">{author}</Typography>
						</Grid>
						<Grid item style={{ maxWidth: '30%', textAlign: 'right' }}>
							<Typography variant="caption" color="textSecondary">v{mod.version}</Typography>
							<Typography variant="caption" color="textSecondary">{mod.license}</Typography>
						</Grid>
					</Grid>
				</div>
				<Divider />
				<div>
					<Grid container justify="space-evenly" alignItems="center">
						<Grid item>
							<ModStatusButton id={mod.identifier} />
						</Grid>
						{mod.resources.homepage && (
							<Grid item>
								<Tooltip title="Mod website">
									<IconButton onClick={this.nav(mod.resources.homepage)}><WebsiteIcon /></IconButton>
								</Tooltip>
							</Grid>
						)}
						{mod.resources.repository && (
							<Grid item>
								<Tooltip title="Code repository">
									<IconButton onClick={this.nav(mod.resources.repository)}><RepoIcon /></IconButton>
								</Tooltip>
							</Grid>
						)}
						{mod.resources.bugtracker && (
							<Grid item>
								<Tooltip title="Bug tracker">
									<IconButton onClick={this.nav(mod.resources.bugtracker)}><BugTrackerIcon /></IconButton>
								</Tooltip>
							</Grid>
						)}
					</Grid>
				</div>
				<Divider />
				<div style={{ margin: 16, fontFamily: 'Roboto', fontSize: 13 }}>
					{mod.descriptionHTML ? <Interweave content={mod.descriptionHTML} /> : <Typography>{mod.description || mod.abstract}</Typography>}
				</div>
			</div>
		);
	}
}

export default ModDetailView;
import React from 'react';
import Head from 'next/head';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import { resolve } from '../helpers';
import { ModsContext } from '../context/modsContext';

const styles = theme => ({
	root: {
		textAlign: 'center',
		paddingTop: theme.spacing.unit * 4
	}
});

class About extends React.Component {
    static contextType = ModsContext;

    render() {
    	const { classes } = this.props;
    	const { theme, toggleTheme } = this.context;

    	return (
    		<React.Fragment>
    			<Head>
    				<title>Next - Nextron (with-javascript-material-ui)</title>
    			</Head>

    			<div className={classes.root}>
    				<Typography variant="h4" gutterBottom>
                        Material-UI
    				</Typography>
    				<Typography variant="subtitle1" gutterBottom>
    					{theme}
    				</Typography>
    				<Typography gutterBottom>
    					<a href={resolve('home')}>
                            Go to home page
    					</a>
    				</Typography>
    				<Button variant="contained" color="primary" onClick={toggleTheme}>
                        Toggle theme
    				</Button>
    			</div>
    		</React.Fragment>
    	);
    }
}

export default withStyles(styles)(About);

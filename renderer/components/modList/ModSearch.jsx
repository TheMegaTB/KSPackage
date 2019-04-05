import React, { Component } from 'react';
import PropTypes from 'prop-types';
import InputAdornment from '@material-ui/core/InputAdornment';
import Input from '@material-ui/core/Input';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';

class ModSearch extends Component {
	static propTypes = {
		onSearch: PropTypes.func
	};

	state = {
		query: ''
	};


	onSearch = () => {
		if (this.debounce) clearTimeout(this.debounce);

		this.debounce = setTimeout(() => {
			this.props.onSearch(this.state.query);
			this.debounce = undefined;
		}, 300);
	};

	render() {
		return (
			<Input
				fullWidth
				value={this.state.query}
				onChange={e => this.setState({ query: e.target.value })}
				onKeyUp={this.onSearch}
				placeholder="Search"
				endAdornment={
					<InputAdornment position="end">
						<IconButton onClick={this.onSearch}><SearchIcon/></IconButton>
					</InputAdornment>
				}
			/>
		);
	}
}

export default ModSearch;
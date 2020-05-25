import React, {Component} from 'react';
import {withStyles} from '@material-ui/core/styles';
import './App.css';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import IconButton from '@material-ui/core/IconButton';
import AceEditor from 'react-ace';

import 'brace/mode/json';
import 'brace/theme/tomorrow_night_blue';

// icons
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import IconDelete from '@material-ui/icons/Delete';
import IconEdit from '@material-ui/icons/Edit';
import {FaBold as BoldIcon} from 'react-icons/all';
import {FaBan as BanIcon} from 'react-icons/all';
import {FaExclamationTriangle as ExclamationIcon} from 'react-icons/all';
import {FaSun as SunIcon} from 'react-icons/all';

const styles = theme => ({
    root: {
        width: '100%',
        height: '100%',
        overflow: 'hidden'
    },
    editorDiv: {
        width: '100%',
        height: 'calc(100% - 64px)',
        overflow: 'auto'
    },
    severity_danger: {
        position: 'relative',
        background: 'red',
    },
    severity_warning: {
        position: 'relative',
        background: 'yellow',
    },
    severity_info: {
        position: 'relative',
        background: 'lightblue',
    },
    summary: {
    },
    summaryLine: {
        display: 'block',
    },
    icon: {
        marginRight: theme.spacing(1),
        width: 32,
    },
    emptyIcon: {
        marginRight: theme.spacing(1),
        width: 32,
        height: 32,
        display: 'inline-block'
    },
    details: {
        verticalAlign: 'top',
        '& td': {
            verticalAlign: 'top',
        }
    },
    itemTitle: {
        fontWeight: 'bold',
    },
    buttonDelete: {
        position: 'absolute',
        right: 56,
        top: theme.spacing(1),
    },
    buttonEdit: {
        position: 'absolute',
        right: 56 + 32 + theme.spacing(1),
        top: theme.spacing(1),
    }
});

const ICON_MAPPING = {
    bolt: BoldIcon,
    'sun-o': SunIcon,
    ban: BanIcon,
    'exclamation-triangle': ExclamationIcon,
};

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            requesting: false,
            json: [],
            error: false,
            screenWidth: window.innerWidth,
            expanded: [],
        };

        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);

        this.readJson();
    }

    readJson() {
        fetch('https://raw.githubusercontent.com/ioBroker/ioBroker.info-messages/master/news.json')
            .then(data => data.json())
            .then(json => {
                json.sort((a, b) => a.created > b.created ? -1 : (a.created < b.created ? 1 : 0));
                this.setState({ json })
            });
    }

    componentDidMount() {
        window.addEventListener('resize', this.updateWindowDimensions());
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions)
    }

    updateWindowDimensions() {
        this.setState({screenWidth: window.innerWidth});
    }

    renderOneNews(item) {
        const id = item.id;
        const Icon = ICON_MAPPING[item['fa-icon']];

        return <ExpansionPanel
            expanded={ this.state.expanded.includes(id)}
            onChange={() => {
            const expanded = [...this.state.expanded];
            const pos = expanded.indexOf(id);
            if (pos === -1) {
                expanded.push(id);
            } else {
                expanded.splice(pos, 1);
            }
            this.setState({ expanded });
        }}>
            <ExpansionPanelSummary
                className={ this.props.classes['severity_' + item.class]}

                expandIcon={<ExpandMoreIcon />}
            >
                { Icon ? <Icon className={ this.props.classes.icon }/> : <div className={ this.props.classes.emptyIcon }/> }
                <Typography className={ this.props.classes.heading }>{ item.created.substring(0, 10) } [{ id }]</Typography>
                <Typography className={ this.props.classes.secondaryHeading }> { item.title.en }</Typography>
                <IconButton size="small" className={ this.props.classes.buttonDelete }><IconDelete/></IconButton>
                <IconButton size="small" className={ this.props.classes.buttonEdit }><IconEdit/></IconButton>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
                <table className={ this.props.classes.details }>
                    <tr><td className={ this.props.classes.itemTitle }>Content: </td><td>{ item.content.en }</td></tr>
                    <tr><td className={ this.props.classes.itemTitle }>Node: </td><td>{ item['node-version']  }</td></tr>
                    <tr><td className={ this.props.classes.itemTitle }>Repo: </td><td>{ item.repo }</td></tr>
                </table>
            </ExpansionPanelDetails>
        </ExpansionPanel>
    }

    render() {
        return <div className={ this.props.classes.root}>
            <AppBar position="static">
                <Toolbar>
                    <h5>News</h5>
                </Toolbar>
            </AppBar>
            <div className={ this.props.classes.editorDiv}>
                {/*<AceEditor
                    height="100%"
                    width="100%"
                    mode="json"
                    value={ this.state.json }
                    theme="tomorrow_night_blue"
                    onChange={ newValue => {
                        let error = false;
                        try {
                            JSON.parse(newValue)
                        } catch (e) {
                            error = true;
                        }
                        this.setState({json: newValue, error});
                    }}
                    setOptions={{
                        enableBasicAutocompletion: true,
                    }}
                    name="UNIQUE_ID_OF_DIV"
                    editorProps={{ $blockScrolling: true }}
                />*/}
                { this.state.json.map(item => this.renderOneNews(item)) }
            </div>
        </div>;
    }
}

export default withStyles(styles)(App);

import React from 'react';
import {
  Route,
  Switch,
  Link,
  withRouter,
  Redirect
} from 'react-router-dom';
import {connect} from "react-redux";
import classnames from 'classnames';
import styles from "./styles.module.css";
import {updateNodesBasic} from '../../../redux/actions/general.js'
import {SearchModule} from '../../../Component/NodeComs.jsx';

const optionItem = (nodeId, self)=>{
  return (
    <div
      key={"key_Belong_options_"+index}
      nodeid={nodeId}
      onClick={(e)=>{e.stopPropagation();e.preventDefault(); self._set_choice(e.currentTarget.getAttribute('nodeid'));}}>
      <span>
        {self.props.nounsBasic[nodeId].name}
      </span>
    </div>
  )
}

class BelongOptions extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      axios: false,
      choice: null, //record the chosen node
      options: []
    };
    this._render_Options = this._render_Options.bind(this);
    this._set_nounDelete = this._set_nounDelete.bind(this);
    this._set_choice = (choice)=> this.setState({choice: choice});
    //_axios post input to db
    //_axios get options from db
    this.style={

    }
  }

  _set_nodeChoice(nodeBasic){
    //create obj to fit the format of state in redux
    let insertObj = {};
    insertObj[nodeBasic.id] = nodeBasic;

    //pass the node basic into redux first,
    //so the handler would not need to fetch node data from db again
    this.props._submit_Nodes_insert(insertObj);
    //no need to fetch node data from db again for any condition gave the choice a non-false value
    //has already save the data of node in reducer.
    this._set_choice(nodeBasic.id);
  }

  //_axios post, announce success to parent if no error

  componentDidUpdate(prevProps, prevState, snapshot){

  }

  componentDidMount() {
    //_axios get options from db
    //pass list to redux in case any one of nodes had not est. basic info
  }

  componentWillUnmount() {

  }

  _render_Options(){
    let items = this.state.options.map((nodeId, index)=>{
      return optionItem(nodeId, this);
    });

    return items;
  }

  render(){
    return(
      <div
        className={classnames(styles.comBelongOptions)}>
        {this._render_Options()}
        {
          <div>
            <SearchModule
              _set_nodeChoice={this._set_nodeChoice}/>
          </div>

        }
        {
          this.state.choice &&

          //warning modal, on dark bg, asking type
        }
      </div>
    )
  }
}

const mapStateToProps = (state)=>{
  return {
    userInfo: state.userInfo,
    unitCurrent: state.unitCurrent,
    i18nUIString: state.i18nUIString,
    nounsBasic: state.nounsBasic,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    _submit_Nodes_insert: (obj) => { dispatch(updateNodesBasic(obj)); },
  }
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(BelongOptions));
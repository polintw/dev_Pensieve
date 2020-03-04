import React from 'react';
import {
  Link,
  Route,
  withRouter
} from 'react-router-dom';
import {connect} from "react-redux";
import classnames from 'classnames';
import styles from "./styles.module.css";
import CreateShare from '../../../../Unit/Editing/CreateShare.jsx';

class Chain extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      editingOpen: false,
      onCreate: false
    };
    this._submit_Share_New = this._submit_Share_New.bind(this);
    this._handleClick_plainOpen = this._handleClick_plainOpen.bind(this);
    this._handleMouseOn_Create = ()=> this.setState((prevState,props)=>{return {onCreate: prevState.onCreate?false:true}});
  }

  _submit_Share_New(dataObj){
    /*
      Fetch list again
    */
  }

  _handleClick_plainOpen(event){
    event.preventDefault();
    event.stopPropagation();
    this.setState({editingOpen: true});
  }

  componentDidUpdate(prevProps, prevState, snapshot){

  }

  componentDidMount(){

  }

  componentWillUnmount(){

  }

  render(){
    const recKeys = Object.keys(this.props.belongsByType);

    return(
      <div
        className={classnames(styles.comChain)}>
        {
          (recKeys.length > 0) &&
          <div>
            <div
              className={classnames(styles.boxCreate)}
              onClick={this._handleClick_plainOpen}
              onMouseEnter={this._handleMouseOn_Create}
              onMouseLeave={this._handleMouseOn_Create}>
              {"Upload"}
            </div>
            <CreateShare
              forceCreate={this.state.editingOpen}
              _submit_Share_New={this._submit_Share_New}
              _refer_von_Create={this.props._refer_von_cosmic}/>
          </div>
        }
      </div>
    )
  }
}

const mapStateToProps = (state)=>{
  return {
    userInfo: state.userInfo,
    i18nUIString: state.i18nUIString,
    belongsByType: state.belongsByType
  }
}

const mapDispatchToProps = (dispatch) => {
  return {

  }
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(Chain));
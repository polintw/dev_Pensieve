import React from 'react';
import {
  Route,
  Switch,
  withRouter,
  Redirect
} from 'react-router-dom';
import {connect} from "react-redux";
import classnames from 'classnames';
import styles from "./styles.module.css";
import WithinSign from './partSign/WithinSign.jsx';
//import UnitUnsign from '../Unit/UnitUnsign/UnitUnsign.jsx';
import NavWithin from '../Components/NavWithin/NavWithin.jsx';
import NavOptionsUnsign from '../Components/NavOptions/NavOptionsUnsign.jsx';
//import ModalBox from '../Components/ModalBox.jsx';
//import ModalBackground from '../Components/ModalBackground.jsx';
//import BooleanDialog from '../Components/Dialog/BooleanDialog/BooleanDialog.jsx';

class Within_Sign extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      switchTo: null
    };
    this._refer_von_Sign = this._refer_von_Sign.bind(this);
    this.style={
      Within_Around_backplane:{
        width: '100%',
        height: '100%',
        position: 'fixed',
        backgroundColor: '#FCFCFC'
      },
    }
  }

  _refer_von_Sign(identifier, route){
    switch (route) {
    case 'user':
      this.setState((prevState, props)=>{
        let switchTo = {
          params: '/cosmic/users/'+identifier+'/accumulated',
          query: ''
        };
        return {switchTo: switchTo}
      });
      break;
    case 'noun':
      this.setState((prevState, props)=>{
        let switchTo = {
          params: '/cosmic/explore/node',
          query: '?nodeid='+identifier
        };
        return {switchTo: switchTo}
      })
      break;
    default:
      window.location.assign(route)
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot){
    //set the state back to default if the update came from Redirect
    //preventing Redirect again which would cause error
    if(this.state.switchTo){
      this.setState({
        switchTo: null
      });
    }
  }

  componentDidMount() {

  }

  componentWillUnmount() {

  }

  render(){
    if(this.state.switchTo){return <Redirect to={this.state.switchTo.params+this.state.switchTo.query}/>}
      /*
    return(
      <div>
        <div style={this.style.Within_Around_backplane}></div>
        <div
          className={classnames(styles.comWithinSign)}>
          <Switch>
            <Route path="/cosmic/explore/unit" render={(props)=> UnsignWithinCosmic(props, this) }/>
            <Route path="/" render={(props)=> UnsignWithin(props, this) }/>
          </Switch>
        </div>
        {
          this.props.messageBoolean['render'] &&
          <ModalBox containerId="root">
            <ModalBackground onClose={()=>{}} style={{position: "fixed", backgroundColor: 'rgba(51, 51, 51, 0.3)'}}>
              <div
                className={"boxDialog"}>
                <BooleanDialog
                  customButton={this.props.messageBoolean['customButton']}
                  message={this.props.messageBoolean['message']}
                  _positiveHandler={this.props.messageBoolean['handlerPositive']}
                  _negativeHandler={this.props.messageBoolean['handlerNegative']}/>
              </div>
            </ModalBackground>
          </ModalBox>
        }

      </div>
    )
    */

    return(
      <div>
        <div style={this.style.Within_Around_backplane}></div>
        <div
          className={classnames(styles.comWithinSign)}>
          <Switch>

            <Route path="/" render={(props)=> UnsignWithin(props, this) }/>
          </Switch>
        </div>
      </div>
    )
  }

}

/*const UnsignWithinCosmic = ( routeProps, parent) => {
  // this component need to follow the style of Within_Cosmic,
  // but the 'main controller' was different
  return (
    <div>
      <div
        className={classnames(styles.boxNavOptionsCosmic)}>
        <NavOptionsUnsign {...routeProps} _refer_to={parent._refer_von_Sign}/>
      </div>
      <div
        className={classnames(styles.boxAroundContent)}>
        <div
          className={classnames(
            styles.boxContentFilledLeft)} />
        <div
          className={classnames(styles.boxAroundContentCenter)}>
          <Switch>
            <Route render={(routeProps)=> <UnitUnsign {...routeProps} _refer_von_unit={parent._refer_von_Sign}/>}/>
          </Switch>
        </div>
        <div
          className={classnames(
            styles.boxContentFilledRight)} />
      </div>
      <div
        className={classnames(styles.boxNavWithinCosmic)}>
        <NavWithin {...routeProps} _refer_to={()=>{window.location.assign('/')}}/>
      </div>
    </div>
  )
}
*/

const UnsignWithin = ( routeProps, parent) => {
  return (
    <div>
      <div
        className={classnames(styles.boxNavOptions)}>
        <NavOptionsUnsign {...routeProps} _refer_to={parent._refer_von_Sign}/>
      </div>
      <div
        className={styles.boxWithinSign}>
        <WithinSign {...routeProps}/>
      </div>
      <div
        className={classnames(styles.boxNavAround)}>
        <NavWithin {...routeProps} _refer_to={()=>{window.location.assign('/')}}/>
      </div>
    </div>
  )
}

const mapStateToProps = (state)=>{
  return {
    messageBoolean: state.messageBoolean
  }
}

const mapDispatchToProps = (dispatch) => {
  return {

  }
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(Within_Sign));

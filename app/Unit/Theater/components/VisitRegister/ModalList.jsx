import React from 'react';
import {
  Link,
  Route,
  withRouter
} from 'react-router-dom';
import {connect} from "react-redux";
import FacebookLogin from 'react-facebook-login';
import classnames from 'classnames';
import styles from "./styles.module.css";
import ModalBox from '../../../../Components/ModalBox.jsx';
import ModalBackground from '../../../../Components/ModalBackground.jsx';
import SvgArrowStick from '../../../../Components/Svg/SvgArrowStick.jsx';
import {
  _axios_get_signedList,
  _axios_get_userUnitSign
} from './axios.js';
import {
  cancelErr,
  uncertainErr
} from '../../../../utils/errHandlers.js';
import {
  outside
} from '../../../../../config/services.js'

class ModalList extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      axios: false,
      signed: false,
      signedBtnMessage: null,
      signedUsers: [],
      onBackArrow: false
    };
    this.axiosSource = axios.CancelToken.source();
    this._render_signedUsers = this._render_signedUsers.bind(this);
    this._set_signedList = this._set_signedList.bind(this);
    this._handleRes_fbLoginRes = this._handleRes_fbLoginRes.bind(this);
    this._handleEnter_backArrow = this._handleEnter_backArrow.bind(this);
    this._handleLeave_backArrow = this._handleLeave_backArrow.bind(this);
  }

  componentDidUpdate(prevProps, prevState, snapshot){

  }

  componentDidMount(){
    this._set_signedList();
  }

  componentWillUnmount(){
    if(this.state.axios){
      this.axiosSource.cancel("component will unmount.")
    }
  }

  _render_signedUsers(){
    let usersDOM = this.state.signedUsers.map((userObj, index)=>{
      return (
        <div>
          <div>
            <img src={userObj.profilePicUrl}/>
          </div>
          <div>
            <span>
              {userObj.name}
            </span>
          </div>
        </div>
      )
    });

    return usersDOM;
  }

  render(){
    let cssVW = window.innerWidth; // for RWD

    return(
      <ModalBox containerId="unitSignFrame">
        <ModalBackground
          onClose={()=>{this.props._set_modalListSwitch(false);}}
          style={{
            width: "100%",
            height: (cssVW < 860) ? "92.4vh" : "100vh",
            position: "absolute",
            top: "0",
            left: "0",
            zIndex: '7',
            backgroundColor: 'rgba(51, 51, 51, 0.85)',
            overflowY: 'scroll' }}>
          <div
            className={classnames(styles.frameModalList)}
            onClick={(event)=>{
              event.stopPropagation();
              this.props._set_modalListSwitch(false);}}>
            <div
              className={classnames(styles.boxRowListBack)}>
              <div
                className={classnames(styles.boxListBack)}
                onTouchStart={this._handleEnter_backArrow}
                onTouchEnd={this._handleLeave_backArrow}
                onMouseEnter={this._handleEnter_backArrow}
                onMouseLeave={this._handleLeave_backArrow}
                onClick={(e)=>{e.stopPropagation();e.preventDefault();this.props._set_modalListSwitch(false);}}>
                <SvgArrowStick
                  customstyle={this.state.onBackArrow ? (
                    {
                      cls1: "{fill:none;stroke:#FFFFFF;stroke-linecap:round;stroke-linejoin:round;stroke-width:18px;}",
                      cls2: "{fill:#FFFFFF}"
                    }
                  ) : (
                    {
                      cls1: "{fill:none;stroke:#d8d8d8;stroke-linecap:round;stroke-linejoin:round;stroke-width:18px;}",
                      cls2: "{fill:#d8d8d8}"
                    }
                  )} />
              </div>
            </div>
            <div
              className={classnames(styles.boxSignedList)}
              onClick={(event) => { event.stopPropagation(); }}>
              <div
                className={classnames(styles.widthList, styles.rowListTitle)}>
                <span
                  className={classnames("fontSubtitle_h5", "colorEditBlack")}>
                  {"Mark your name if you've visited the scene!"}
                </span>
              </div>
              <div
                className={classnames(styles.widthList)}>
                <span>
                  {"Mark your name by "}
                </span>
                <div>
                  <FacebookLogin
                    appId={outside.facebookAppId}
                    autoLoad={false}
                    fields="name,email,picture"
                    callback={this._handleRes_fbLoginRes}
                    textButton={"Continue with Facebook"}
                    size={"medium"}
                    version={"10.0"}
                    cssClass={classnames(styles.btnFacebookLogin)}
                    disableMobileRedirect={true}/>
                </div>
              </div>
              <div
                className={classnames(styles.widthList)}>
                {this._render_signedUsers()}
              </div>
            </div>
          </div>
        </ModalBackground>
      </ModalBox>
    )
  }

  _handleRes_fbLoginRes(response){
    /*
    There three type of response.status according to Facebook:
    - connected
    - not_authorized
    - unknown
    only "connected" has the right response we need.
    ref: https://developers.facebook.com/docs/facebook-login/web#re-asking-declined-permissions
    */
    if(response.status != 'connected'){ return; };
    if(!!response.userID){ return; }; // basically, should not happend

    const self = this;
    this.setState({axios: true});

    _axios_get_userUnitSign(this.axiosSource.token, {
      fbId: response.userID,
      userIdIdentity: "facebook",
      unitId: this.props.unitCurrent.unitId,
      pathProjectName: this.props.unitEntity.pathSubCate.currentPathProject,
      subCateId: this.props.unitEntity.pathSubCate.currentSubCateId
    })
    .then((resObj)=>{
      if(resObj.main.signed){
        self.setState((prevState, props)=>{
          return {
            axios: false,
            signed: true,
            signedBtnMessage: "You've already signed."
          };
        });
      }
      else return _axios_post_userUnitSign(this.axiosSource.token, {
        fbId: response.userID,
        fbName: response.name,
        fbEmail: response.email,
        fbProfilePicUrl: response.picture.data.url,
        userIdIdentity: "facebook",
        unitId: this.props.unitCurrent.unitId,
        pathProjectName: this.props.unitEntity.pathSubCate.currentPathProject,
        subCateId: this.props.unitEntity.pathSubCate.currentSubCateId
      })
      .then((resObj)=>{
        self.setState((prevState, props)=>{
          return {
            axios: false,
            signed: true,
            signedBtnMessage: "You are on the list"
          };
        });
        this._set_signedList();
      });
    })
    .catch(function (thrown) {
      self.setState({axios: false});
      if (axios.isCancel(thrown)) {
        cancelErr(thrown);
      } else {
        let message = uncertainErr(thrown);
        if(message) alert(message);
      }
    });
  }

  _set_signedList(){
    const self = this;
    this.setState({axios: true});

    _axios_get_signedList(this.axiosSource.token, {
      unitId: this.props.unitCurrent.unitId,
      // only PathProject has subCate now, so keep these params simple, but ready for future scale
      subCateId: this.props.unitEntity.pathSubCate.currentSubCateId,
      subCateParent: 'pathProject',
      pathProjectName: this.props.unitEntity.pathSubCate.currentPathProject,
    })
    .then((resObj)=>{
      self.setState((prevState, props)=>{
        return {
          axios: false,
          signedUsers: resObj.main.signUsersArr
        };
      });
    })
    .catch(function (thrown) {
      self.setState({axios: false});
      if (axios.isCancel(thrown)) {
        cancelErr(thrown);
      } else {
        let message = uncertainErr(thrown);
        if(message) alert(message);
      }
    });
  }

  _handleEnter_backArrow(e){
    this.setState((prevState, props)=>{
      return {
        onBackArrow: true
      }
    })
  }

  _handleLeave_backArrow(e){
    this.setState((prevState, props)=>{
      return {
        onBackArrow: false
      }
    })
  }

}


const mapStateToProps = (state)=>{
  return {
    tokenStatus: state.token,
    i18nUIString: state.i18nUIString,
    unitCurrent: state.unitCurrent,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {

  }
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(ModalList));

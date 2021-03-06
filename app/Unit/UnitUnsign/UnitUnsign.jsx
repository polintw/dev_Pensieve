import React from 'react';
import {
  Redirect,
  withRouter,
} from 'react-router-dom';
import {connect} from "react-redux";
import {convertFromRaw} from 'draft-js';
import classnames from 'classnames';
import styles from './styles.module.css';
import Theater from '../Theater/Theater.jsx';
import PathSubcate from '../PathSubcate/PathSubcate.jsx'
import {
  _axios_getUnitData,
  _axios_getUnitImgs,
} from '../utils.js';
import ModalBox from '../../Components/ModalBox.jsx';
import ModalBackground from '../../Components/ModalBackground.jsx';
import {
  setUnitView,
  setUnitSubcate,
} from "../../redux/actions/unit.js";
import {
  setUnitCurrent,
  handleNounsList,
  updateUsersBasic
} from "../../redux/actions/general.js";
import {unitCurrentInit} from "../../redux/states/constants.js";
import {
  cancelErr,
  uncertainErr
} from '../../utils/errHandlers.js';
import _set_HeadInfo from '../../utils/_headSetting.js';

class UnitUnsign extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      axios: false,
      close: false,
      headSetify: false
    };
    this.axiosSource = axios.CancelToken.source();
    this.boxUnitFrame = React.createRef();
    this._render_switch = this._render_switch.bind(this);
    this._close_modal_Unit = this._close_modal_Unit.bind(this);
    this._set_UnitCurrent = this._set_UnitCurrent.bind(this);
    this._construct_UnitInit = this._construct_UnitInit.bind(this);
    this._reset_UnitMount = ()=>{this._set_UnitCurrent();};
    //And! we have to 'hide' the scroll bar and preventing the scroll behavior to the page one for all
    //so dismiss the scroll ability for <body> here
    // document.getElementsByTagName("BODY")[0].setAttribute("style","overflow-y:hidden;");
    /* No need to hidden overflowY! But considert the problem after the 'Related' return, so keep the original code.*/
  }

  _construct_UnitInit(match, location){
    let unitInit= {marksify: false, initMark: "first", layer: 0};
    return unitInit;
  }

  _close_modal_Unit(){
    //close the whole Unit Modal
    //different from the one in Theater, which used only for closing Theater
    let unitCurrentState = Object.assign({}, unitCurrentInit);
    this.props._set_store_UnitCurrent(unitCurrentState);
    this.setState((prevState, props)=>{
      return {
        close: true
      }
    })
  }

  _set_UnitCurrent(){
    const self = this;
    this.setState({axios: true});

    let promiseArr = [
      new Promise((resolve, reject)=>{_axios_getUnitData(this.axiosSource.token, this.unitId).then((result)=>{resolve(result);});}),
      new Promise((resolve, reject)=>{_axios_getUnitImgs(this.axiosSource.token, this.unitId).then((result)=>{resolve(result);});})
    ];
    Promise.all(promiseArr)
    .then(([unitRes, imgsBase64])=>{
      self.setState({axios: false});
      let resObj = JSON.parse(unitRes.data);
      //we compose the marksset here, but sould consider done @ server
      let keysArr = Object.keys(resObj.main.marksObj);//if any modified or update, keep the "key" as string
      let [coverMarks, beneathMarks] = [{list:[],data:{}}, {list:[],data:{}}];
      // due to some historical reason, the marks in unitCurrent has a special format
      keysArr.forEach(function(key, index){
        if(resObj.main.marksObj[key].layer==0){
          coverMarks.data[key]=resObj.main.marksObj[key];
          coverMarks.list[resObj.main.marksObj[key].serial] = key; //let the list based on order of marks, same as beneath
        }else{
          beneathMarks.data[key]=resObj.main.marksObj[key]
          beneathMarks.list[resObj.main.marksObj[key].serial] = key;
        }
      });
      // update the info to redux state aquired here, for other comp. using
      let userBasic = {};
      userBasic[resObj.main.authorBasic.id] = resObj.main.authorBasic;
      self.props._submit_Users_insert(userBasic);
      self.props._submit_NounsList_new(resObj.main.nouns.list);

      //actually, beneath part might need to be rewritten to asure the state could stay consistency
      self.props._set_store_UnitCurrent({
        unitId:self.unitId,
        identity: resObj.main.identity,
        authorBasic: resObj.main.authorBasic,
        coverSrc: imgsBase64.cover,
        beneathSrc: imgsBase64.beneath,
        coverSrcURL: imgsBase64.coverSrcURL,
        beneathSrcURL: imgsBase64.beneathSrcURL,
        coverMarksList:coverMarks.list,
        coverMarksData:coverMarks.data,
        beneathMarksList:beneathMarks.list,
        beneathMarksData:beneathMarks.data,
        nouns: resObj.main.nouns,
        refsArr: resObj.main.refsArr,
        outBoundLink: resObj.main.outBoundLink,
        imgLocation: resObj.main.imgLocation,
        createdAt: resObj.main.createdAt
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

  componentDidUpdate(prevProps, prevState, snapshot){
    // becuase there is chance we jump to another Unit from Related but using the same component
    //so we check if the unit has changed
    //but Notice! always check the diff between the current & pre id from 'path search'
    //due to this is the only reliable and stable source (compare to the unitCurrent)
    let prevParams = new URLSearchParams(prevProps.location.search); //we need value in URL query
    if(this.unitId !== prevParams.get('unitId')){
      //reset UnitCurrent to clear the view
      //and Don't worry about the order between state reset, due to the Redux would keep always synchronized
      let unitCurrentState = Object.assign({}, unitCurrentInit);
      this.props._set_store_UnitCurrent(unitCurrentState);
      this._set_UnitCurrent();
      this.boxUnitFrame.current.scrollTop = 0; // make the Unit view area back to top
    }
    else if(this.urlParams.get('unitView') !== prevParams.get('unitView')){
      this.boxUnitFrame.current.scrollTop = 0; // make the Unit view area back to top
    };
    // and set the info in <head>
    let prevUnitId = prevParams.get('unitId');
    if(
      !this.state.headSetify ||
      (this.unitId !== prevUnitId)
    ){
      let infosetify = _set_contentInfo(this.props);
      if(infosetify){
        this.setState({
          headSetify: true
        });
      };
    };

  }

  componentDidMount(){
    //because we fetch the data of Unit only from this file,
    //now we need to check if it was necessary to fetch or not in case the props.unitCurrent has already saved the right data we want
    this._set_UnitCurrent();
  }

  componentWillUnmount(){
    if(this.state.axios){
      this.axiosSource.cancel("component will unmount.")
    }
    //reset UnitCurrent before leaving
    // It's Important !! next Unit should not have a 'coverSrc' to prevent children component render in UnitModal before Unit data response!
    let unitCurrentState = Object.assign({}, unitCurrentInit);
    this.props._set_store_UnitCurrent(unitCurrentState);
    this.props._set_state_UnitView('theater'); // it's default for next view
    this.props._set_state_UnitSubcate({ next_confirm: false, next_unit: null, first_unit: null}); // reset the subcate state to initial
    // and reset the general vars
    longPlainContentText = '';
    nodesTitle = '';
  }

  _render_switch(paramUnitView){
    switch (paramUnitView) {
      case 'pathsubcate':
        return (
          <PathSubcate
            {...this.props}
            _reset_UnitMount={this._reset_UnitMount}
            _close_theaterHeigher={this._close_modal_Unit}/>
        )
        break;
      default:
        return (
          <Theater
            {...this.props}
            _construct_UnitInit={this._construct_UnitInit}
            _reset_UnitMount={this._reset_UnitMount}
            _close_theaterHeigher={this._close_modal_Unit}/>
        )
        break;
    };
  }

  render(){
    if(this.state.close){
      let toSearch = new URLSearchParams(this.props.location.search);
      // under unsigned Unit view, we close the modal to path'.../unit'
      if(this.props.location.pathname.includes('explore/unit')){
        toSearch.delete('unitId');
        toSearch.delete('unitView');
        toSearch.append('unitId', this.props.anchorUnit);
        return <Redirect
          to={{
            pathname: this.props.location.pathname, // '.../unit'
            search: toSearch.toString(),
            state: {from: this.props.location}
          }}/>
      };
      // or close the Unit modal if we are at other place
      let toPath=this.props.location.pathname.replace("/unit", "");
      toSearch.delete('unitId');
      toSearch.delete('unitView');
      return <Redirect to={{
        pathname: (toPath.length > 0) ? toPath: '/', // totally empty would cause error,
        search: toSearch.toString(),
        state: {from: this.props.location}
        }}/>
    }

    this.urlParams = new URLSearchParams(this.props.location.search);
    this.unitId = this.urlParams.get('unitId');
    let paramUnitView = this.urlParams.get('unitView');
    let cssVW = window.innerWidth;

    return(
      <ModalBox containerId="root">
        <ModalBackground
          _didMountSeries={()=>{window.addEventListener('touchmove', (e)=>{e.stopPropagation();});}}
          _willUnmountSeries={()=>{window.removeEventListener('touchmove', (e)=>{e.stopPropagation();});}}
          onClose={()=>{this._close_modal_Unit();}}
          style={
            cssVW < 860 ? {
              height: 'unset',
              minHeight: "100vh",
              position: "relative",
              backgroundColor:  'rgba(51, 51, 51, 0.85)'
            } : {
              position: "fixed",
              backgroundColor: 'rgba(51, 51, 51, 0.3)'
            }}>
            <div
              id={"unitSignFrame"}
              className={classnames(styles.boxUnitSignFrame)}/>
            <div
              id={"unitFrame"}
              ref={this.boxUnitFrame}
              className={classnames(styles.boxUnitFrame)}>
              <article
                className={classnames(styles.boxHiddenContent)}>
                <h3>
                  {nodesTitle}
                </h3>
                <p>
                  {longPlainContentText}
                </p>
              </article>
              <div
                className={classnames(styles.boxUnitContent)}
                onClick={this._close_modal_Unit}>
                {this._render_switch(paramUnitView)}
              </div>
            </div>
        </ModalBackground>
      </ModalBox>
    )
  }
}

// we add a section to handle the plain text content rendering for search engine crawler
let longPlainContentText = '';
let nodesTitle = ''; // both 'longPlainContentText' & 'nodesTitle' are for the 'boxHiddenContent'
const _set_contentInfo = (props)=>{
  if( !props.unitCurrent.coverSrc ) return false; // means the unit's data hasn't fetched
  // and make node list meanwhile check the node's data fetched
  let nodesString = '';
  props.unitCurrent.nouns.list.forEach((nodeId, index) => {
    if( index > 0 ) nodesString += "/";
    nodesString += props.unitCurrent.nouns.basic[nodeId].name;
    nodesTitle += props.unitCurrent.nouns.basic[nodeId].name + '|';
  });
  let obj = { // claim obj passed to _set_HeadInfo()
    title: '',
    description: '',
    img: ''
  };
  // first, make the text of description
  let description = '', loopCount = 0;
  while (loopCount < props.unitCurrent.coverMarksList.length) {
    let markId = props.unitCurrent.coverMarksList[loopCount];
    let markText = convertFromRaw(props.unitCurrent.coverMarksData[markId].editorContent).getPlainText(' ');
    if(description.length < 180) description += markText;
    longPlainContentText += markText;
    loopCount ++;
  };
  obj.title = "Cornerth．" + props.unitCurrent.authorBasic.account +  '\xa0' + "|" +  '\xa0' + nodesString;
  obj.description = description;
  obj.img = props.unitCurrent.coverSrcURL+'?type=thumb';
  _set_HeadInfo(window.location.href, obj);
  return true;
}

const mapStateToProps = (state)=>{
  return {
    userInfo: state.userInfo,
    unitView: state.unitView,
    unitCurrent: state.unitCurrent,
    unitSubmitting: state.unitSubmitting
  }
}

const mapDispatchToProps = (dispatch)=>{
  return {
    _submit_NounsList_new: (arr) => { dispatch(handleNounsList(arr)); },
    _submit_Users_insert: (obj) => { dispatch(updateUsersBasic(obj)); },
    _set_state_UnitView: (expression)=>{dispatch(setUnitView(expression));},
    _set_store_UnitCurrent: (obj)=>{dispatch(setUnitCurrent(obj));},
    _set_state_UnitSubcate: (expression)=>{dispatch(setUnitSubcate(expression));},
  }
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(UnitUnsign));

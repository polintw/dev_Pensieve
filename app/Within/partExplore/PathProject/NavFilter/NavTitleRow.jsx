import React from 'react';
import {
  Link,
  withRouter
} from 'react-router-dom';
import {connect} from "react-redux";
import classnames from 'classnames';
import styles from "./styles.module.css";
import SuggestNodes from './SuggestNodes.jsx';
import NavBtnRow from './NavBtnRow.jsx';
import NavFilterMode from './NavFilterMode.jsx';
import {SvgArrowToTop} from '../../../../Components/Svg/SvgArrow.jsx';
import SvgFilterNode from '../../../../Components/Svg/SvgFilter_Node.jsx';

class NavTitleRow extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      onArrow: false,
      onNodeLink: false,
    };
    this._render_resetLink = this._render_resetLink.bind(this);
    this._render_filterNode = this._render_filterNode.bind(this);
    this._handleClick_resetLink= this._handleClick_resetLink.bind(this);
    this._handleEnter_NodeLink = this._handleEnter_NodeLink.bind(this);
    this._handleLeave_NodeLink = this._handleLeave_NodeLink.bind(this);
    this._handleLeave_CloseArrow = this._handleLeave_CloseArrow.bind(this);
    this._handleEnter_CloseArrow = this._handleEnter_CloseArrow.bind(this);
  }

  componentDidUpdate(prevProps, prevState, snapshot){

  }

  componentDidMount(){

  }

  componentWillUnmount(){

  }

  _render_filterNode(){
    let userLogin = (this.props.tokenStatus== 'invalid' || this.props.tokenStatus == 'lack') ? false : true;
    return (
      <Link
        nodeid={this.filterNode}
        to={userLogin ? ("/cosmic/explore/node?nodeid=" + this.filterNode) : ''}
        className={classnames('plainLinkButton')}
        style={{
          display: 'inline-block',
          cursor: userLogin ? "pointer" : "text"
        }}
        onClick={(e)=>{ if(!userLogin){e.preventDefault();}; }}
        onMouseEnter={this._handleEnter_NodeLink}
        onMouseLeave={this._handleLeave_NodeLink}>
        {(this.filterNode in this.props.nounsBasic) &&
          <span
            className={classnames(
              "fontNodesEqual", "weightBold", "colorEditBlack",
              styles.spanLinkNode,
              { [styles.spanLinkNodeMouse]: (this.state.onNodeLink == this.filterNode) && userLogin }
            )}>
            {this.props.nounsBasic[this.filterNode].name}</span>
        }
      </Link>
    )
  }

  _render_resetLink(){
    let toSearch = new URLSearchParams(this.props.location.search); //we need value in URL query
    toSearch.delete("filterNode");
    let linkObj = {
      pathname: this.props.location.pathname,
      search: toSearch.toString(),
      state: {from: this.props.location}
    };

    return (
      <Link
        to={linkObj}
        className={classnames(
          'plainLinkButton', styles.linkBlock,
           styles.boxSvgArrow)}
        onClick={this._handleClick_resetLink}
        onMouseEnter={this._handleEnter_CloseArrow}
        onMouseLeave={this._handleLeave_CloseArrow}>
        <SvgArrowToTop
          mouseOn={this.state.onArrow}
          customStyles={{fillColorMouseOn: '#ff8168', fillColor: '#a3a3a3'}}/>
      </Link>
    );
  }

  render(){
    let urlParams = new URLSearchParams(this.props.location.search); //we need value in URL query
    if(urlParams.has('filterNode')){
      this.filterNode = urlParams.get('filterNode');
    } else this.filterNode = null;
    if(urlParams.has('subCate')){
      this.currentSubCate = urlParams.get('subCate');
    } else this.currentSubCate = false;

    return (
      <div className={styles.comNavTitleRow}>
        {
          !this.props.viewFilter ?
          (
            !!this.filterNode ? (
              <div
                className={classnames(styles.boxFilterNode)}>
                <div>
                  <span
                    className={classnames(
                      styles.spanFilterCross,
                      "fontContent", "weightBold", "lineHeight15", "colorAssistGold")}>
                      {"X "}
                  </span>
                  {this._render_filterNode()}
                </div>
                {this._render_resetLink()}
              </div>
            ):(
              <div
                className={classnames(styles.boxFilterSelection)}>
                <div>
                  {
                    !this.currentSubCate &&
                    <SuggestNodes
                      {...this.props}
                      listLocation={this.props.listLocation}
                      listIdentity={this.props.listIdentity}/>
                  }
                </div>
                <NavBtnRow
                  {...this.props}/>
              </div>
            )
          ) : (
            <div
              className={classnames(styles.boxFilterNav)}>
              <NavFilterMode/>
            </div>
          )
        }
      </div>
    )
  }

  _handleClick_resetLink(event){
    // a <Link> comp, keep it act as default
    event.stopPropagation();
    // we are here to reset mouse state
    this.setState({
      onArrow: false
    })
  }

  _handleEnter_CloseArrow(e){
    this.setState((prevState, props)=>{
      return {
        onArrow: true
      }
    })
  }

  _handleLeave_CloseArrow(e){
    this.setState((prevState, props)=>{
      return {
        onArrow: false
      }
    })
  }

  _handleEnter_NodeLink(e) {
    let targetNode = e.currentTarget.getAttribute('nodeid');
    this.setState({ onNodeLink: targetNode })
  }

  _handleLeave_NodeLink(e) {
    this.setState({ onNodeLink: false })
  }
}


const mapStateToProps = (state)=>{
  return {
    tokenStatus: state.token,
    userInfo: state.userInfo,
    i18nUIString: state.i18nUIString,
    nounsBasic: state.nounsBasic
  }
}

const mapDispatchToProps = (dispatch) => {
  return {

  }
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(NavTitleRow));
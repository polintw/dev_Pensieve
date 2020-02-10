import React from 'react';
import classnames from 'classnames';
import styles from "./styles.module.css";
import FetchBroads from '../../../Component/Fetch/FetchBroads.jsx';
import NailSharedIndex from '../../../Component/Nails/NailSharedIndex/NailSharedIndex.jsx';
import NailSquare from '../../../Component/Nails/NailSquare/NailSquare.jsx';
import NailToday from '../../../Component/Nails/NailToday/NailToday.jsx';
import NailBroaded from '../../../Component/Nails/NailBroaded/NailBroaded.jsx';
import NailWideDisplay from '../../../Component/Nails/NailWideDisplay/NailWideDisplay.jsx';

export function nailChart(choice, unitId, pare){
  switch (choice) {
    case 0:
      return (
        <div
          key={'key_CosmicMain_Nails_'+unitId}
          className={classnames(styles.boxNail, styles.heightNine, styles.boxWide)}>
          <NailWideDisplay
            {...pare.props}
            unitId={unitId}
            unitBasic={pare.state.unitsBasic[unitId]}
            marksBasic={pare.state.marksBasic}/>
        </div>
      )
      break;
    case 1:
    //originally was take by NailRegular, now no longer used in Index
      return
      break;
    case 2:
      return (
        <div
          key={'key_CosmicMain_Nails_'+ unitId}
          className={classnames(styles.boxNail, styles.heightNine, styles.boxNarrow)}>
          <NailSquare
            {...pare.props}
            unitId={unitId}
            linkPath={pare.props.match.url+'/unit'}
            unitBasic={pare.state.unitsBasic[unitId]}
            marksBasic={pare.state.marksBasic}/>
        </div>
      )
      break;
    case 3:
      return (
        <div
          key={'key_CosmicMain_Nails_'+unitId}
          className={classnames(styles.boxNail, styles.heightNine, styles.boxEven)}>
          <NailWideDisplay
            {...pare.props}
            unitId={unitId}
            unitBasic={pare.state.unitsBasic[unitId]}
            marksBasic={pare.state.marksBasic}/>
        </div>
      )
      break;
    case 4:
      return (
        <div
          key={'key_CosmicMain_Nails_'+ unitId}
          className={classnames(styles.boxNail, styles.heightThird, styles.boxThree)}
          style={{backgroundColor: 'transparent'}}>
          <NailSharedIndex
            {...pare.props}
            unitId={unitId}
            linkPath={pare.props.match.url+'/unit'}
            unitBasic={pare.state.unitsBasic[unitId]}
            marksBasic={pare.state.marksBasic}/>
        </div>
      )
      break;
    case 5:
      return (
        <div
          key={'key_CosmicMain_rows_NailBroaded_'+ unitId}
          className={classnames(styles.boxNail, styles.heightNine, styles.boxNarrow)}>
          <FetchBroads
            {...pare.props}
            unitId={unitId}>
            <NailBroaded
              {...pare.props}
              unitId={unitId}
              linkPath={pare.props.match.url+'/unit'}
              unitBasic={pare.state.unitsBasic[unitId]}
              marksBasic={pare.state.marksBasic}/>
          </FetchBroads>
        </div>
      )
      break;
    case 6:
      return (
        <div
          key={'key_CosmicMain_rows_NailBroaded_'+ unitId}
          className={classnames(styles.boxNail, styles.heightNine, styles.boxWide)}>
          <FetchBroads
            {...pare.props}
            unitId={unitId}>
            <NailBroaded
              {...pare.props}
              unitId={unitId}
              linkPath={pare.props.match.url+'/unit'}
              unitBasic={pare.state.unitsBasic[unitId]}
              marksBasic={pare.state.marksBasic}/>
          </FetchBroads>
        </div>
      )
      break;
    default:
      return (
        <div
          key={'key_CosmicMain_Nails_'+ unitId}
          className={classnames(styles.boxNail, styles.heightNine, styles.boxNarrow)}>
          <NailSquare
            {...pare.props}
            unitId={unitId}
            linkPath={pare.props.match.url+'/unit'}
            unitBasic={pare.state.unitsBasic[unitId]}
            marksBasic={pare.state.marksBasic}/>
        </div>
      )
  }
};


export function separationLine(remainder, index){
  let caseRef = ()=>{
    switch (remainder) {
      case 1:
        return (
          /*'9' is the length of the firstBlock*/
          (index < 9) ? 0: false
        )
        break;
      case 2:
        return (
          (index < 9) ? false: 2
        )
        break;
      case 4:
        return 2
        break;
      case 6: //only for firstBlock (space between rows of wides)
        return (
          (index < 9) ? 1: false
        )
        break;
      case 7:
        return (
          (index < 9) ? false : 2
        )
        break;
      case 8: //only for firstBlock (space between rows of wides)
        return (
          (index < 9) ? 2: false
        )
        break;
      case 9:
        return (
          (index < 9) ?  false : 1
        )
        break;
      default:
        false
    }
  }

  switch (caseRef()) {
    case 0: //used between rows wides
      return (
        <div
          key={'key_CosmicMain_NailsSparation_'+index}
          className={classnames(styles.boxFillHoriz)}
          style={{height: '10vw'}}/>
      )
    case 1:
      return (
        <div
          key={'key_CosmicMain_NailsSparation_'+index}
          className={classnames(styles.boxFillCenterLine)}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 561 1"
            className={classnames(styles.decoSeparationHorz)}>
            <defs><style>{".cls-1-strokeSeparationHorz{fill:none;stroke:#c4c4c4;stroke-linecap:round;stroke-miterlimit:10;opacity:0.78;}"}</style></defs>
            <g id="圖層_2" data-name="圖層 2">
              <g id="圖層_1-2" data-name="圖層 1">
                <line className="cls-1-strokeSeparationHorz" x1="0.5" y1="0.5" x2="560.5" y2="0.5"/></g></g></svg>
        </div>
      )// width and marginLeft of div combined to be 96.9% to match the border of the img in NailThumb
      break;
    case 2:
      return (
        <div
          key={'key_CosmicMain_NailsSparation_'+index}
          className={classnames(styles.boxFillHoriz)}/>
      )
      break;
    default:
      return false
  }
}

export function axios_GET_selectedList(cancelToken){
  let url = '/router/feed/custom/selected';

  return axios.get(url, {
    headers: {
      'charset': 'utf-8',
      'token': window.localStorage['token']
    },
    cancelToken: cancelToken
  }).then(function (res) {
    let resObj = JSON.parse(res.data);

    return resObj;
  }).catch(function (thrown) {
    throw thrown;
  });
}

export function axios_feedList_customNew(cancelToken){
  let url = '/router/feed/custom/new';

  return axios.get(url, {
    headers: {
      'charset': 'utf-8',
      'token': window.localStorage['token']
    },
    cancelToken: cancelToken
  }).then(function (res) {
    let resObj = JSON.parse(res.data);

    return resObj;
  }).catch(function (thrown) {
    throw thrown;
  });
}

export function axios_Units(cancelToken, reqList){
  //compose url to a string, due to unknonw reason to axios that the prop "params" didn'y work
  //and Notice ! reqList would be empty if no item in list, but it would cause error when compose url

  return axios.get('/router/units', {
    headers: {
      'charset': 'utf-8',
      'token': window.localStorage['token']
    },
    params: {
      unitsList: (reqList.length>0)? reqList : "[]"
    },
    cancelToken: cancelToken
  }).then(function (res) {
    let resObj = JSON.parse(res.data);

    return resObj;
  }).catch(function (thrown) {
    throw thrown;
  });
}

export function axios_visit_Index(cancelToken){
  let url = '/router/visit/index';

  return axios({ //use confic directly to assure the patch was not influenced by empty .body obj
    url:url,
    method: "patch",
    headers: {
      'charset': 'utf-8',
      'token': window.localStorage['token']
    },
    cancelToken: cancelToken
    //close if there is no error response
  }).catch(function (thrown) {
    throw thrown;
  });
}

export function axios_visit_GET_last(cancelToken){
  let url = '/router/visit/index';

  return axios({ //use confic directly to assure the patch was not influenced by empty .body obj
    url:url,
    method: "get",
    headers: {
      'charset': 'utf-8',
      'token': window.localStorage['token']
    },
    cancelToken: cancelToken
  }).then(function (res) {
    let resObj = JSON.parse(res.data);

    return resObj;
  }).catch(function (thrown) {
    throw thrown;
  });
}

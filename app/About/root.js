import React from 'react';
import ReactDOM from 'react-dom';
import {createStore, applyMiddleware} from "redux";
import thunk from 'redux-thunk';
import {Provider} from "react-redux";
import jwtDecode from 'jwt-decode';
import moment from 'moment';
import About from './About/About.jsx';
import storeAbout from "../redux/reducers/about.js";
import {
  mountUserInfo,
  setTokenStatus
} from "../redux/actions/general.js";
import tokenRefreshed from '../utils/refreshToken.js';
import {
  statusVerifiedErr
} from "../utils/errHandlers.js";


const loggedin = !!window.localStorage['token'];
//this page would render no matter the token status,
//so the store was 100% needed.
const store = createStore(storeAbout, applyMiddleware(thunk));
/*
if(loggedin){
  const statusVerified = ()=>{ //could be a independent utils like the /refreshToken
    axios.get('/router/status', {
      headers: {
          'token': window.localStorage['token']
      }
    }).then(function(res){
      store.dispatch(mountUserInfo(res.data.main.userInfo));
      store.dispatch(setTokenStatus({token: 'verified'}));
      ReactDOM.hydrate(<Provider store={store}><About/></Provider>, document.getElementById("root"));
    }).catch((err)=>{
      /* This component has 2 status: log in, or not
      if not, just render the plain page for guset.
      But for token state, record the difference by res.status
      */
/*
      let verifiedErrify = statusVerifiedErr(err, store); //set token status to Redux by f() import from errHandlers
      //Render the dom no matter the result of the errHandlers
      //and let the DOM itself check the status
      ReactDOM.hydrate(<Provider store={store}><About/></Provider>, document.getElementById("root"));
    })
  };

  let decoded = jwtDecode(window.localStorage['token']);
  let deadline = moment.unix(decoded.exp).subtract(12, 'h');//refresh token earlier in case the user log out during the surfing
  let expired = moment().isAfter(deadline);

  if(expired){
     //send 'refresh' token, which get when last renew
     //return to status check after new token back

    tokenRefreshed().then(()=>{
      statusVerified();
    }).catch((error)=>{
      store.dispatch(setTokenStatus({token: 'invalid'}));

      //and Render the dom, let the DOM itself check the status
      ReactDOM.hydrate(<Provider store={store}><About/></Provider>, document.getElementById("root"));
    })

   }
  else{
    //still check status, get basic data
    //and then render view
    statusVerified();
  }

}else{
  store.dispatch(setTokenStatus({token: 'lack'}));

  //Render the dom, let the DOM itself check the status
  ReactDOM.hydrate(<Provider store={store}><About/></Provider>, document.getElementById("root"));
}
*/
ReactDOM.hydrate(<Provider store={store}><About/></Provider>, document.getElementById("root"));

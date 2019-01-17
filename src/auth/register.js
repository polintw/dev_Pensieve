const express = require('express');
const register = express.Router();
const fs = require('fs');
const path = require("path");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {verify_email} = require('../../config/jwt.js');
const validateRegisterInput = require('./validation/register');
const deliverVerifiedMail = require('./validation/verifiedMail');
const {
  _select_Basic
} = require('../utils/dbSelectHandler.js');
const {
  _insert_basic
} = require('../utils/dbInsertHandler.js');
const {
  _handler_ErrorRes,
} = require('../utils/reserrHandler.js');

const _create_new_ImgFolder = (userId)=>{
  return new Promise((resolve,reject)=>{
    let imgFolderPath = path.join(__dirname, '/../..', '/faked_Pics/'+userId);
    fs.mkdir(imgFolderPath, function(err){
      if(err) {reject(err);return;}
      resolve();
    })
  });
};

const _promise_customBreak_res = (errSet)=>{
  let errObj = {
    errSet: errSet,
    custom: true
  };
  return errObj;
}

//handle register request
register.use(function(req, res) {
  const { errors, isValid } = validateRegisterInput(req.body);

  if(!isValid) {
    let errSet = {
      "status": 400,
      "message": errors,
      "console": ''
    };
    return _handler_ErrorRes(errSet, res);
  }

  let mysqlForm = {
    accordancesList: [[req.body.email]]
  },
  conditionUser = {
    table: "verifications",
    cols: ["email"],
    where: ["email"]
  };
  _select_Basic(conditionUser, mysqlForm.accordancesList).then((rows)=>{
    //distinguish iis the user already exist or not.
    if(rows.length>0) {
      let errSet = {
        "status": 400,
        "message": {'email': 'email already exist!'},
        "console": ''
      };
      throw _promise_customBreak_res(errSet);
    }else{
      const newUser = {
        email: req.body.email,
        password: req.body.password,
        first_name: req.body.firstName,
        last_name: req.body.lastName
      };
      return newUser;
    }
  }).then((newUser)=>{
    //after confimation, create new user account officially.
    return _insert_basic({
      table: 'users',
      col: '(first_name, last_name, account, status)'},
      [[
        newUser.first_name,
        newUser.last_name,
        newUser.first_name+" "+newUser.last_name,
        'unverified'
      ]]
    ).then((resultObj)=>{
      const userId = resultObj.insertId;
      const payload = {
        user_Id: userId,
        token_property: 'emailVerified'
      };
      let tokenEmail = '';
      jwt.sign(JSON.parse(JSON.stringify(payload)), verify_email, {
        expiresIn: '1d'
      }, (err, token) => {
          if(err){
            err = ('There is some error in token' + err);
            throw {status: 500, err: err};
          }
          else {
            tokenEmail = token;
          }
      });
      return bcrypt.genSalt(10).then((err, salt) => {
        if(err) throw {status: 500, err: 'There was an error'+err};
        Promise.resolve(salt);
      }).then((salt)=>{
        return bcrypt.hash(newUser.password, salt).then((err, hash) => {
          if(err) throw {status: 500, err: 'There was an error'+err};
          Promise.resolve(hash);
        })
      }).then((hash)=>{
        let pinsertNewVerifi = Promise.resolve(_insert_basic({table: 'verifications', col: '(id_user, email, password)'}, [[userId, newUser.email, hash]]).catch((errObj)=>{throw errObj})),
            pinsertNewSheet = Promise.resolve(_insert_basic({table: 'sheets', col: '(id_user)'}, [[userId]]).catch((errObj)=>{throw errObj})),
            pinsertEmailToken = Promise.resolve(_insert_basic({table: 'users_apply', col: '(id_user, token_email, status)'}, [[userId, tokenEmail, 'unverified']]).catch((errObj)=>{throw errObj})),
            pcreateImgFolder = Promise.resolve(_create_new_ImgFolder(userId).catch((errObj)=>{throw errObj}));

        return Promise.all([pinsertNewVerifi, pinsertNewSheet, pinsertEmailToken, pcreateImgFolder]).then((results)=>{
          deliverVerifiedMail(newUser, tokenEmail);
        });
      });
    });
  }).then(()=>{
    //complete the process, and response to client
    let resData = {};
    resData.error = 0;
    resData['message'] = 'Registered successfully! Please verify your email address';
    res.status(201).json(resData);
  }).catch((errObj)=>{
    //catch errors, both custom and internal
    if(errObj.custom) _handler_ErrorRes(errObj.errSet, res);
    else{
      console.log("error occured during: auth/register promise: "+errObj.err)
      let errSet = {
        "status": errObj.status,
        "message": {'warning': 'Internal Server Error, please try again later'},
        "console": 'Error Occured: Internal Server Error'
      };
      _handler_ErrorRes(errSet, res);
    }
  });
});

module.exports = register;

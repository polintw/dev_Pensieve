const fs = require('fs');
const path = require("path");
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const {verify_key} = require('../../../config/jwt.js');
const {connection_key} = require('../../../config/database.js');
const {
  userImg_SecondtoSrc
} = require('../../../config/path.js');

const _DB_nouns = require('../../../db/models/index').nouns;
const {
  _handler_err_BadReq,
  _handler_err_Unauthorized,
  _handler_err_Internal,
  _handle_ErrCatched,
  forbbidenError,
  notAcceptable
} = require('../../utils/reserrHandler.js');

const database = mysql.createPool(connection_key);

function shareHandler_POST(req, res){
  jwt.verify(req.headers['token'], verify_key, function(err, payload) {
    if (err) {
      _handler_err_Unauthorized(err, res)
    } else {
      let userId = payload.user_Id;
      let requesterId = req.requesterId;
      database.getConnection(function(err, connection){
        if (err) {
          _handler_err_Internal(err, res);
          console.log("error occured when getConnection in newShare handle.")
        }else{
          new Promise((resolve, reject)=>{
            //add it into shares as a obj value
            console.log('add new one: deal img.');
            let modifiedBody = new Object();
            let coverBase64Buffer ,beneathBase64Buffer;
            //deal with cover img first.
            let coverBase64Splice = req.body.coverBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
            coverBase64Buffer = new Buffer(coverBase64Splice[2], 'base64');
            //then deal with beneath img if any.
            if(req.body.beneathBase64){
              let beneathBase64Splice = req.body.beneathBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
              beneathBase64Buffer = new Buffer(beneathBase64Splice[2], 'base64');
            }
            fs.writeFile(path.join(__dirname, userImg_SecondtoSrc+userId+'/'+req.body.submitTime+"_layer_0.jpg"), coverBase64Buffer, function(err){
              if(err) {reject(err);return;}
              modifiedBody['url_pic_layer0'] = userId+'/'+req.body.submitTime+'_layer_0.jpg';
              if(req.body.beneathBase64){
                fs.writeFile(path.join(__dirname, userImg_SecondtoSrc+userId+'/'+req.body.submitTime+"_layer_1.jpg"), beneathBase64Buffer, function(err){
                  if(err) {reject(err);return;}
                  modifiedBody['url_pic_layer1'] = userId+'/'+req.body.submitTime+'_layer_1.jpg';
                  resolve(modifiedBody);
                });
              }else{
                resolve(modifiedBody);
              }
            });
          }).then((modifiedBody)=>{
            Object.assign(modifiedBody, req.body);
            delete modifiedBody.coverBase64;
            delete modifiedBody.beneathBase64;
            return(modifiedBody);
          }).then(function(modifiedBody){
            console.log('add new one, write into the table: units.');
            return new Promise((resolve, reject)=>{
              let unitProfile = {
                'id_author': userId,
                'url_pic_layer0': modifiedBody.url_pic_layer0,
                'url_pic_layer1': modifiedBody.url_pic_layer1,
                'id_primer': req.query.primer?req.query.primer:null
              }
              connection.query('INSERT INTO units SET ?', unitProfile, function(err, result, fields) {
                if (err) {reject(err);return;}
                console.log('database connection: success.')
                modifiedBody['id_unit'] = result.insertId;
                resolve(modifiedBody)
              })
            })
          }).then(function(modifiedBody){
            console.log('add new one, write into the table: marks.');
            return new Promise((resolve, reject)=>{
              let valuesArr = modifiedBody.joinedMarksList.map(function(markKey, index){
                let markObj = modifiedBody.joinedMarks[markKey];
                return [
                  modifiedBody.id_unit,
                  userId,
                  markObj.layer,
                  markObj.top,
                  markObj.left,
                  markObj.serial,
                  markObj.editorContent
                ]
              })
              connection.query('INSERT INTO marks (id_unit, id_author, layer,portion_top,portion_left,serial,editor_content) VALUES ?; SHOW WARNINGS;', [valuesArr], function(err, result, fields) {
                if (err) {reject(err);return;}
                console.log('database connection: success.')
                resolve(modifiedBody)
              })
            })
          }).then(function(modifiedBody){
            console.log('add new one, write into the table: attribution.');
            /* Below, is the part to create a new noun by user, concept not use for now
            let _db_createNoun = (resolve, reject, newNounskey)=>{
              let valuesArr = newNounskey.map((nounKey, index)=>{
                return [modifiedBody.nouns.basic[nounKey].name]
              })
              connection.query('INSERT INTO nouns (name) VALUES ?', [valuesArr], function(err, results, fields) {
                if (err) {reject(err);return;}
                console.log('database connection: success.')
                for(let i=0; i< results.affectedRows ; i++){
                  // ! should have extra confirmation for continuity!
                  modifiedBody.nouns.basic[newNounskey[i]]["id"] = results.insertId+i;
                }
                resolve(modifiedBody)
              })
            };// Should consider isolate this part, create a new noun, to a independent api!!
            */
            return new Promise((resolve, reject)=>{
              /*also in the concept of new noun create by user
              let newNounskey = [];
              modifiedBody.nouns.list.forEach((nounId, index)=>{
                if(!modifiedBody.nouns.basic[nounId].ify){
                  newNounskey.push(nounId);
                }
              });
              if(newNounskey.length>0){
                _db_createNoun(resolve, reject, newNounskey, modifiedBody);
              }else{
                resolve(modifiedBody);
              }
            }).then((modifiedBody)=>{
              return new Promise((resolve, reject)=>{
                _db_addAttribution(resolve, reject);
              })*/
              let valuesArr = [];
              modifiedBody.nouns.list.forEach(function(nounKey, index){
                _DB_nouns.findById(nounKey).then(noun=>{ //check if the noun exist!
                  if(!noun) return;
                  let nounBasic = modifiedBody.nouns.basic[nounKey];
                  valuesArr.push([
                    nounBasic.id,
                    modifiedBody.id_unit,
                    userId
                  ]);
                })
              })
              if(valuesArr.length<1) throw new forbbidenError({"warning": "you've passed an invalid nouns key"}, 120);
              connection.query('INSERT INTO attribution (id_noun, id_unit, id_author) VALUES ?', [valuesArr], function(err, rows, fields) {
                if (err) {reject(err);return;}
                console.log('database connection: success.')
                resolve(modifiedBody)
              })
            })
          }).then(()=>{
            let resData = {};
            resData['error'] = 0;
            resData['message'] = 'post req completed!';
            res.status(201).json(resData);
            connection.release();
          }).catch((err)=>{
            console.log("error occured during newShare promise: "+err)
            _handler_err_Internal(err, res);
            connection.release();
          });
        }
      })
    }
  })
}

module.exports = shareHandler_POST

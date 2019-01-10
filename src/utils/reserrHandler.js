exports._handler_err_BadReq = function(err, res){
  let resData = {};
  resData['error'] = 1;
  resData['message'] = 'Error Occured: '+err;
  console.log('BadReq Error: '+err);
  res.status(400).json(resData);
 }

exports._handler_err_Unauthorized = function(err, res){
  let resData = {};
  resData['error'] = 1;
  resData['message'] = "Token is invalid";
  res.status(401).json(resData);
}

exports._handler_err_NotFound = function(err, res){
  console.log("resHandler: not found, "+ err)
  let resData = {};
  resData['error'] = 1;
  resData['message'] = 'Page not found!';
  res.status(404).json(resData);
}

exports._handler_err_Internal = function(err, res){
  let resData = {};
  resData['error'] = 1;
  resData['message'] = 'Error Occured: Internal Server Error';
  res.status(500).json(resData);
}
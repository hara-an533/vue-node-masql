const jwt = require('jsonwebtoken');
const serect = 'token';  //密钥，不能丢
 
module.exports =(token) => {
 
  if (token){
    // 解析
    let decoded = jwt.decode(token, serect);
    return decoded;
  }
};
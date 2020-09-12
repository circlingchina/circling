const crypto = require('crypto');

const genRandomString = function(length){
  return crypto.randomBytes(Math.ceil(length/2))
    .toString('hex')
    .slice(0,length);
};

let sha512 = function(password, salt){
  let hash = crypto.createHmac('sha512', salt);
  hash.update(password);
  let value = hash.digest('hex');
  return {
    salt,
    hexdigest: value
  };
};

function saltHashPassword(userpassword) {
  let salt = genRandomString(16);
  return sha512(userpassword, salt);
}

module.exports = {
  sha512,
  saltHashPassword,
  genRandomString,
};

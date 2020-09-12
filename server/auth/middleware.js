function verifyAuth(req,res,next) {
  if ( !req.isAuthenticated() ) {
    return res.json(401, {
      err: 'login required'
    //   sessionId: req.session.id
    });
  }
  next();
}

module.exports = {
  verifyAuth
};

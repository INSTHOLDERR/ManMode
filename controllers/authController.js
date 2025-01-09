import passport from 'passport';







// Google authentication middleware
const googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });

// Google authentication callback
const googleAuthCallback = (req, res, next) => {
    passport.authenticate('google', { failureRedirect: '/login' }, (err, user, info) => {
        if (err) {
            return next(err); 
        }
        if (!user) {
            return res.redirect('/login');
        }

      if(!user.isActive){
        return res.redirect("/login")
      }
        req.login(user, (loginErr) => {
            if (loginErr) {
                return next(loginErr);
            }

     
            req.session.user = {
                id: user._id,
                email: user.email,
                name: user.name,
            };

            console.log("user sessionnnnn", req.session.user); 

            return res.redirect('/userhome');
        });
    })(req, res, next);
};


export default { googleAuth, googleAuthCallback };

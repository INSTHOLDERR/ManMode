import passport from 'passport';

// Initiate Google OAuth
export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
});

// Google OAuth callback
export const googleAuthCallback = (req, res, next) => {
  passport.authenticate('google', { failureRedirect: '/login' }, (err, user) => {
    if (err)   return next(err);
    if (!user) return res.redirect('/login');
    if (!user.isActive) return res.redirect('/login?blocked=1');

    req.login(user, loginErr => {
      if (loginErr) return next(loginErr);

      req.session.user = {
        id:    user._id.toString(),
        email: user.email,
        name:  user.name,
      };

      req.session.save(err => {
        if (err) return next(err);
        res.redirect('/userhome');
      });
    });
  })(req, res, next);
};

export default { googleAuth, googleAuthCallback };

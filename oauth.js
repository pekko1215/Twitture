// http://passportjs.org/guide/twitter/
const TWITTER_KEYS = require('./config').twitter;

const passport = require('passport')
  , TwitterStrategy = require('passport-twitter').Strategy;

// Sessionの設定
// http://passportjs.org/guide/configure/
passport.serializeUser(function(user, done) {
    done(null, user.id);
});
passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

passport.use(new TwitterStrategy({
    consumerKey: TWITTER_KEYS.consumerKey,
    consumerSecret: TWITTER_KEYS.consumerSecret,
    callbackURL: TWITTER_KEYS.callbackURL
  },
  function(token, tokenSecret, profile, done) {
    passport.session.id = profile.id;
    passport.session.token = token;
    passport.session.tokenSecret = tokenSecret;
    passport.session.username = profile.username;
    passport.session.displayName = profile.displayName;
    passport.session.icon = profile.photos[0].value.replace('_normal','_bigger');
    // tokenとtoken_secretをセット
    profile.twitter_token = token;
    profile.twitter_token_secret = tokenSecret;

    process.nextTick(function () {
        return done(null, profile);
    });
  }
));

module.exports = {passport: passport};
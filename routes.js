var configRoutes;
const fs = require('fs');
const Twitter = require('twitter');
const TWITTER_KEYS = require('./config').twitter;
configRoutes = function(app, server, passport) {
    app.get('/', function(req, res,next) {
        // 認証保護
        if (passport.session && passport.session.id) {
            res.render('app',{
                username:passport.session.username,
                displayName:passport.session.displayName,
            });
        } else {
            next();
        }
    });
    app.get('/utils/list', function(req, res,next) {
        // 認証保護
        if (passport.session && passport.session.id) {
            var client = new Twitter({
                consumer_key:TWITTER_KEYS.consumerKey,
                consumer_secret:TWITTER_KEYS.consumerSecret,
                access_token_key:passport.session.token,
                access_token_secret:passport.session.tokenSecret
            })
            client.get('search/tweets',{q:`from:${passport.session.username} AND min_replies:1 OR to:${passport.session.username}`})
            .then(data=>{
                var {statuses} = data;
                res.json(statuses);
            })
        } else {
            next();
        }
    });

    // passport-twitter ----->
    // http://passportjs.org/guide/twitter/
    app.get('/auth/twitter', passport.authenticate('twitter'));
    app.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
            successRedirect: '/',
            failureRedirect: '/'
        }));
    // <-----
}

module.exports = { configRoutes: configRoutes };
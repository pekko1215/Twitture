var configRoutes;
const fs = require('fs');
const Twitter = require('twitter');
const TWITTER_KEYS = require('./config').twitter;
const webshot = require('webshot')
const ejs = require('ejs');
const ejsbase = fs.readFileSync('./render/liner/index.ejs', 'utf8')
const ccss = fs.readFileSync('./render/liner/style.css', 'utf-8')


configRoutes = function(app, server, passport) {
    app.get('/', function(req, res, next) {
        // 認証保護
        if (passport.session && passport.session.id) {
            res.render('app', {
                username: passport.session.username,
                displayName: passport.session.displayName,
            });
        } else {
            next();
        }
    });
    app.get('/utils/list', function(req, res, next) {
        // 認証保護
        if (passport.session && passport.session.id) {
            var client = new Twitter({
                consumer_key: TWITTER_KEYS.consumerKey,
                consumer_secret: TWITTER_KEYS.consumerSecret,
                access_token_key: passport.session.token,
                access_token_secret: passport.session.tokenSecret
            })
            client.get('search/tweets', { q: `from:${passport.session.username} AND min_replies:1` })
                .then(data => {
                    var { statuses } = data;
                    res.json(statuses);
                })
        } else {
            res.redirect('/')
        }
    });

    app.get('/utils/replies', function(req, res, next) {
        // 認証保護

        var id = req.query.id;

        if (!passport.session || !passport.session.id) {
            res.redirect('/');
        }
        var client = new Twitter({
            consumer_key: TWITTER_KEYS.consumerKey,
            consumer_secret: TWITTER_KEYS.consumerSecret,
            access_token_key: passport.session.token,
            access_token_secret: passport.session.tokenSecret
        })
        var prom = client.get('statuses/show/' + id, {})
        var ret = [];
        var callback = (data) => {
            ret.push(data);
            if (data.in_reply_to_status_id_str) {
                prom = client.get('statuses/show/' + data.in_reply_to_status_id_str, {});
                prom.then(callback)
            } else {
                res.json(ret.reverse());
            }
        }
        prom.then(callback).catch(() => {
            res.json([])
        });
    });

    app.post('/utils/create', function(req, res, next) {
        if (passport.session && passport.session.id) {
            var arr = req.body.list.map(tweet => {
                return {
                    id: tweet.user.screen_name,
                    name: tweet.user.name,
                    icon: tweet.user.profile_image_url,
                    text: tweet.text.replace(/@.+? /g, ''),
                    isOwner: tweet.user.id_str == passport.session.id,
                    images: tweet.extended_entities && tweet.extended_entities.media ? tweet.extended_entities.media.map(d => d.media_url) : []
                }
            })
            var html = ejs.render(ejsbase, { tweets: arr });
            var stream = webshot(html, null, {
                siteType: 'html',
                customCSS: ccss,
                shotSize: { width: 'all', height: 'all' },
                shotOffset: {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0
                },
                captureSelector: 'table'
            })
            var shot = '';
            stream.on('data', data => shot += data.toString('binary'));
            stream.on('end', () => {
                res.set('Content-Type', 'image/png');
                res.end(shot, 'binary');
            })
        }
    })
    app.get('/utils/list', function(req, res, next) {
        // 認証保護
        if (passport.session && passport.session.id) {
            var client = new Twitter({
                consumer_key: TWITTER_KEYS.consumerKey,
                consumer_secret: TWITTER_KEYS.consumerSecret,
                access_token_key: passport.session.token,
                access_token_secret: passport.session.tokenSecret
            })
            client.get('search/tweets', { q: `from:${passport.session.username} AND min_replies:1 OR to:${passport.session.username}` })
                .then(data => {
                    var { statuses } = data;
                    res.json(statuses);
                })
        } else {
            next();
        }
    });

    app.post('/utils/tweet', function(req, res) {
        console.log(req.body.img.length)
        if (passport.session && passport.session.id) {
            var client = new Twitter({
                consumer_key: TWITTER_KEYS.consumerKey,
                consumer_secret: TWITTER_KEYS.consumerSecret,
                access_token_key: passport.session.token,
                access_token_secret: passport.session.tokenSecret
            })
            client.get('media/upload', {media_data:req.body.img.toString()})
                .then(data => {
                    res.json(statuses);
                })
                .catch(err=>{

                })
        } else {
            next();
        }
    })

    // passport-twitter ----->
    // http://passportjs.org/guide/twitter/
    app.get('/auth/twitter', passport.authenticate('twitter'));
    app.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
            successRedirect: '/',
            failureRedirect: '/'
        }));
}

module.exports = { configRoutes: configRoutes };
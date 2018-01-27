const webshot = require('webshot');
const http = require('http');
const {passport} = require('./oauth');
const routes = require('./routes');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();

const server = http.createServer(app);

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({uploadDir:'./tmp',limit:'100mb',extended: true }));
app.use(bodyParser.json());
app.use(session({secret:require('./config').session.secret}));
app.use(passport.initialize());
app.use(passport.session())

routes.configRoutes(app,server,passport);
app.use(express.static(__dirname + '/public'));

server.listen(3000);

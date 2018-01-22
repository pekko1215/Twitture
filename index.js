const webshot = require('webshot');
const http = require('http');
const {passport} = require('./oauth');
const routes = require('./routes');
const express = require('express');
const session = require('express-session');
const app = express();

const server = http.createServer(app);

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(passport.initialize());
app.use(passport.session())
app.use(session({secret:require('./config').session.secret}));

routes.configRoutes(app,server,passport);
app.use(express.static(__dirname + '/public'));

// webshot('./render/liner/out.html','google.png',{
//	siteType:'file',
//	customCSS:require('fs').readFileSync('./render/liner/style.css','utf-8')
// },(err)=>{
//	console.log(err)
// })

server.listen(3000);
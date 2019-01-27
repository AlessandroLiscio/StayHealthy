// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var passport = require('passport');
// var flash    = require('connect-flash');
var path = require('path');
var fs = require('fs');

var https = require('https')
var compression = require('compression');
var redirectToHTTPS = require('express-http-to-https').redirectToHTTPS;

var certOptions = {
    key: fs.readFileSync(path.resolve('server.key')),
    cert: fs.readFileSync(path.resolve('server.crt'))
  }

var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

// configuration ===============================================================
require('./config/passport.ts')(passport); // pass passport for configuration
require('dotenv').config(); // pass environment variables for configuration


// set up our express application

app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json({ limit: '5mb'})); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));
app.use(compression());
app.use(redirectToHTTPS());

app.use(express.static(path.join(__dirname, '../public')));


app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({
    secret: 'ilovecats', // session secret
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
  

// routes ======================================================================
require('./routes.ts')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
 https.createServer(certOptions, app).listen(443, () => console.log('Server listening on port: 3000'));
 app.listen(80, ()=> console.log("Listening on port 80"));
//app.listen(process.env.PORT);
//console.log('Server listening on port: ' + process.env.PORT);

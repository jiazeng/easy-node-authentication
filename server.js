// server.js

// set up ======================================================================
// set up server and get all the tools needed
var express  = require('express');
var app      = express();
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan'); //load morgan to do logging
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session'); //allow user session
var RedisStore = require('connect-redis')(session); //stores session


//load the cookie signature secret
//this is used to digitally sign the cookie so that express can tell if it was 
//tampered with on the client red this from an environment variable set
//the environment variable using the command $export 
//cookie_sig_secret = "my secret value" and then start the server 
var cookieSigSecret = process.env.COOKIE_SIG_SECRET;
if(!cookieSigSecret) {
    console.error('Please set COOKIE_SIG_SECRET');
    process.exit(1);
}

var configDB = require('./config/database.js');

// configuration ===============================================================
// connect to mongoDB
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
//app.use(bodyParser.urlencoded({ extended: true }));

//app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session( { //session is a function
    secret: cookieSigSecret,
    resave: false,
    saveUninitialized: false,
    store: new RedisStore()
}));

app.use(passport.initialize()); //add authentication to the app
app.use(passport.session()); // persistent login sessions, add session support
//app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

//tell experss to serve static files from the /static/public
//subdirectory (any user can see these)
app.use(express.static(__dirname + '/static/public'));
//add a middleware function to verify that the user is
//autenticated: if so, continue processing; if not,
//redirect back to the home page
//stop users to see /secure page if not authenticated
app.use(function(req, res, next) {
    //console.log(req.session);
    console.log("Auth Status: " + req.isAuthenticated());

    if(req.isAuthenticated()) {
        console.log("is authenticated");
        return next();
    } else {
        res.redirect('/');
    }
    //next(); 
});

//tell express to serve static files form the /static/secure
//subdirectory as well, but since this middleware function
//is added aftre the check above, express will never call it
//if the function above doesn't call next()
app.use('/js', express.static(__dirname + 'static/js'));
app.use(express.static(__dirname + '/static/secure'));

//start the user
app.listen(80, function() {
    console.log('server is listening...')
});
// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
//var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var RedisStore = require('connect-redis')(session); //stores session

var cookieSigSecret = process.env.COOKIE_SIG_SECRET;
if(!cookieSigSecret) {
    console.error('Please set COOKIE_SIG_SECRET');
    process.exit(1);
}

var configDB = require('./config/database.js');

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));

//app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session( { //session is a function
    secret: cookieSigSecret,
    resave: false,
    saveUninitialized: false,
    store: new RedisStore()
}));

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// // launch ======================================================================
// app.listen(port);
// console.log('The magic happens on port ' + port);




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
app.use(express.static(__dirname + '/static/secure'));





//start the user
app.listen(80, function() {
    console.log('server is listening...')
});
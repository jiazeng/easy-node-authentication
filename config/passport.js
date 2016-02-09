// load all the things we need
var LocalStrategy    = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

// load up the user model
var User       = require('../app/models/user');

// load the auth variables
// var fbConfig = require('./auth'); // use this one for testing
var fbConfig = require('../secret/oauth-facebook.json');
//add the callback URL
fbConfig.callbackURL = 'http://localhost:8080/auth/facebook/callback';

var dbConfig = require('../secret/config-mongo.json');    

module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session
        
    // used to serialize the user to the session store
    passport.serializeUser(function(user, done) {
        done(null, user);
    });
    // used to descerialize the data back into a full user object on next request
    passport.deserializeUser(function(user,done) {
    done(null,user);
});

    // =========================================================================
    // LOCAL====================================================================
    // =========================================================================

var localStrategy = new LocalStrategy(dbConfig, function(username, password, done) {
    console.log("looking up user: " + username + ": " + password);
    // asynchronous
    process.nextTick(function() {
        User.findOne({ 'local.username' : username}, function(err, user) {
//      User.findOne({ 'local.email' :  email }, function(err, user) {
            // if there are any errors, return the error
            if(err) {
                console.log(err);
                return done(err);
            }
            //if no user is found, return the message
            if(user) {
                console.dir(user);
                return done(null, user);
            }
            
            if(!user.validPassword) {
                return done(null, false);
            }
            // else {
            //     // create the user
            //     var newUser            = new User();

            //     newUser.local.email    = email;
            //     newUser.local.password = newUser.generateHash(password);

            //     newUser.save(function(err) {
            //         if (err)
            //             return done(err);
            //         return done(null, newUser);
            //     });
            // }
        });
              
    });
});
    

//     // =========================================================================
//     // LOCAL LOGIN =============================================================
//     // =========================================================================
//     passport.use('local-login', new LocalStrategy({
//         // by default, local strategy uses username and password, we will override with email
//         usernameField : 'email',
//         passwordField : 'password',
//         passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
//     },
//     function(req, email, password, done) {
//         if (email)
//             email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching

//         // asynchronous
//         process.nextTick(function() {
//             User.findOne({ 'local.email' :  email }, function(err, user) {
//                 // if there are any errors, return the error
//                 if (err)
//                     return done(err);

//                 // if no user is found, return the message
//                 if (!user)
//                     return done(null, false);

//                 if (!user.validPassword(password))
//                     return done(null, false);

//                 // all is well, return user
//                 else
//                     return done(null, user);
//             });
//         });

//     }));

    // // =========================================================================
    // // LOCAL SIGNUP ============================================================
    // // =========================================================================
    

    // passport.use('local-signup', new LocalStrategy({
    //     // by default, local strategy uses username and password, we will override with email
    //     usernameField : 'email',
    //     passwordField : 'password',
    //     passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    // },
    // function(req, email, password, done) {
    //     if (email)
    //         email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching

    //     // asynchronous
    //     process.nextTick(function() {
    //         // if the user is not already logged in:
    //         if (!req.user) {
    //             User.findOne({ 'local.email' :  email }, function(err, user) {
    //                 // if there are any errors, return the error
    //                 if (err)
    //                     return done(err);
    //                 // check to see if theres already a user with that email
    //                 if (user) {
    //                     return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
    //                 } else {
    //                     // create the user
    //                     var newUser            = new User();

    //                     newUser.local.email    = email;
    //                     newUser.local.password = newUser.generateHash(password);

    //                     newUser.save(function(err) {
    //                         if (err)
    //                             return done(err);
    //                         return done(null, newUser);
    //                     });
    //                 }
    //             });
    //         // if the user is logged in but has no local account...
    //         } else if ( !req.user.local.email ) {
    //             // ...presumably they're trying to connect a local account
    //             // BUT let's check if the email used to connect a local account is being used by another user
    //             User.findOne({ 'local.email' :  email }, function(err, user) {
    //                 if (err)
    //                     return done(err);           
    //                 if (user) {
    //                     // return done(null, false, req.flash('loginMessage', 'That email is already taken.'));
    //                     return done(null, false);
    //                     // Using 'loginMessage instead of signupMessage because it's used by /connect/local'
    //                 } else {
    //                     var user = req.user;
    //                     user.local.email = email;
    //                     user.local.password = user.generateHash(password);
    //                     user.save(function (err) {
    //                         if (err)
    //                             return done(err);                           
    //                         return done(null,user);
    //                     });
    //                 }
    //             });
    //         } else {
    //             // user is logged in and already has a local account. Ignore signup. (You should log out before trying to create a new account, user!)
    //             return done(null, req.user);
    //         }
    //     });
    // }));

    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    
    // create the facebook authentication strategy
    // is called after the uesr has authenticated and FB has returned 
    // to the server 'profile' contains the full profile info
    var fbStrategy = new FacebookStrategy({
        clientID        : fbConfig.clientID,
        clientSecret    : fbConfig.clientSecret,
        callbackURL     : fbConfig.callbackURL,
        profileFields   : ['email', 'id', 'displayName', 'name'],
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    // faceboook will send back the token and profile
    function(req, token, refreshToken, profile, done) {
        // asynchronous
        process.nextTick(function() {
            // // check if the user is already logged in
             //if (!req.user) {
                // find the user in the database based on their facebook id
                User.findOne({ 'facebook.id' : profile.id }, function(err, user) {
                    if (err)
                        return done(err);
                    if (user) {
                        // // if there is a user id already but no token (user was linked at one point and then removed)
                        // if (!user.facebook.token) {
                        //     user.facebook.token = token;
                        //     user.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                        //     user.facebook.email = (profile.emails[0].value || '').toLowerCase();

                        //     user.save(function(err) {
                        //         if (err)
                        //             return done(err);
                                    
                        //         return done(null, user);
                        //     });
                        // }
                        console.log("found user");
                        return done(null, user); // user found, return that user
                    } else {
                        // if there is no user found with that facebook id, create them
                        var newUser            = new User();
                        // set all of the facebook information in user model
                        newUser.facebook.id    = profile.id;
                        //newUser.facebook.token = token;
                        // newUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                        //newUser.facebook.name = profile._json.name;
                        newUser.facebook.name = profile.displayName;
                        newUser.facebook.email = profile._json.email;
                        newUser.facebook.gender = profile._json.gender;
                        newUser.facebook.photos = profile._json.photos;
                        //newUser.facebook.email = (profile.emails[0].value || '').toLowerCase();
                        // save user to the database
                        newUser.save(function(err) {
                            if (err)
                                return done(err);
                            // if successful, return the new user 
                            console.log('User Saved Successful');        
                            return done(null, newUser);
                        });
                    }
                });  

            // } else {
            //     // user already exists and is logged in, we have to link accounts
            //     var user            = req.user; // pull the user out of the session

            //     user.facebook.id    = profile.id;
            //     user.facebook.token = token;
            //     user.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
            //     user.facebook.email = (profile.emails[0].value || '').toLowerCase();

            //     user.save(function(err) {
            //         if (err)
            //             return done(err);
                        
            //         return done(null, user);
            //     });

            //}
        });
        console.log('Authentication Successful!');
        console.dir(profile);
        done(null, profile);
    });
    passport.use(fbStrategy);
    passport.use(localStrategy);
};


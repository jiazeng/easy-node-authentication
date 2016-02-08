var express = require('express');

module.exports = function(app, passport) {

// normal routes ===============================================================

    // // routes for home page
    // app.get('/', function(req, res) {
    //     //res.render('/index.html');
    //     res.redirect('/index.html');
    // });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
        res.redirect('profile.html', {
        //res.render('profile', {
            user : req.user // get the user out of session and pass to template
        });
    });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            //res.render('login.ejs', { message: req.flash('loginMessage') });
            res.redirect('login.html');
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            //res.render('signup.ejs', { message: req.flash('signupMessage') });
            res.redirect('signup.html');
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
        }));

    // facebook -------------------------------
        // send to facebook to do the authentication
        app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));
        
       // log in     
       app.get('/auth/facebook/callback', passport.authenticate('facebook'), 
            function(req, res) {
                //console.log(res);
                //res.redirect('/secure.html'); 
                res.redirect('/profile.html');
            });
            
        // log out    
        app.get('/logout', function(req, res) {
            req.logout();
            res.redirect('/');
        });
        
        app.get('/data', function(req, res) {
            return res.json(req.user);
        });

// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================

    // locally --------------------------------
        app.get('/connect/local', function(req, res) {
            //res.render('connect-local.ejs', { message: req.flash('loginMessage') });
            res.redirect('connect-local.html');
        });
        app.post('/connect/local', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
        }));

    // facebook -------------------------------
        // send to facebook to do the authentication
        app.get('/connect/facebook', passport.authorize('facebook', { scope : 'email' }));

        // handle the callback after facebook has authorized the user
        app.get('/connect/facebook/callback',
            passport.authorize('facebook', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));
            
        app.get('/api/v1/users/me/', function(req, res) {
            //req.user is the currently authenticated user
            res.json(req.user);
});


// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // // local -----------------------------------
    // app.get('/unlink/local', isLoggedIn, function(req, res) {
    //     var user            = req.user;
    //     user.local.email    = undefined;
    //     user.local.password = undefined;
    //     user.save(function(err) {
    //         res.redirect('/profile');
    //     });
    // });

    // // facebook -------------------------------
    // app.get('/unlink/facebook', isLoggedIn, function(req, res) {
    //     var user            = req.user;
    //     user.facebook.token = undefined;
    //     user.save(function(err) {
    //         res.redirect('/profile');
    //     });
    // });
};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();
    // if they aren't redirect them to the home page
    res.redirect('/');
}

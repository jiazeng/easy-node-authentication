// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {
    'facebookAuth' : {
        "clientID": "559985240830591",
        "clientSecret": "411595028dc9859f1e0d5534ed33d8ad",
        'callbackURL'     : 'http://localhost:8080/auth/facebook/callback'
    },
};

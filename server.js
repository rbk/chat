/*
*
*   Title: Embeddable chat
*   Author: Richard
*
*/
// Base Server
var express      = require('express');
var app          = express();
var http         = require('http').Server(app);
var io           = require('socket.io')(http);
var port         = process.env.PORT || 3001;

// Database of choice
var mongoose     = require('mongoose');

// Extras
var cookieParser = require('cookie-parser');
var router       = express.Router();
var sanitizer    = require('sanitizer');
var md5          = require('MD5');
var fs           = require('fs');
// npm install helmet // security

// Form and upload processing
var bodyParser = require('body-parser');
var multer  = require('multer');
app.use(bodyParser());
app.use(multer({ dest: './uploads/'}));

console.log('TODO: User notifications');
console.log('TODO: Multiple rooms');
console.log('TODO: Private messaging');
console.log('TODO: Resposive');
console.log('TODO: Basic auth');


// Session stuff
var session    = require('express-session');
var MongoStore = require('connect-mongo')(session);

// Set static file folder
app.use(express.static('assets'));


// Set the template engine
app.engine('.html', require('ejs').__express);
app.engine('.js', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');


// Cookie Parser
app.use(cookieParser('secret-string'));

// Log HTTP requests
var logger = require('morgan');
app.use(logger(':remote-addr :method :url'));



// MongoDB Connection
mongoose.connect('mongodb://localhost/chat');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
    console.log('Connected to MongoDB!!!');
});


// MongoDB Session Store
app.use(session({
    secret: 'secret-cookie-string',
    name: 'user_session_id',
    cookie: { path: '/', httpOnly: true, secure: false, maxAge: 1209600 },
    store: new MongoStore({
        db: 'socketio',
        collection: 'sessions',
        host: '127.0.0.1',
        port: 27017,
        username: '',
        password: '',
        ssl: false,
        mongoose_connection: db
    })
}));

// GET Session ID
app.get('/session',function(req, res, next) {
    var session = req.session;
    res.setHeader('Content-Type', 'text/html');
    res.send( req.session.id );
    res.end();
})

// DEFINE Collections/Models
var Message = mongoose.model( 'Message', {
    name: String,
    message: String,
    date: { type: Date, default: Date.now }
});
var User = mongoose.model( 'User', {
    username: String,
    hashed_password: String,
    socket_id: String,
    session_id: String,
    message_count: Number
});
var Session = mongoose.model( 'Session', {
    type: String,
    name: String,
    ip: String,
    duration: Number
});


// Static routes
app.get('/',            function(req, res){ res.render('chat'); });
app.get('/chat',        function(req, res){ res.render('chat', { title: 'Chat' }); });
app.get('/embed',        function(req, res){ res.render('embed', { title: 'Chat' }); });

app.get('/chat/:id', function(req,res){
    res.render('chat', { id : req.params.id });
});


// app.get('/chat/:id',function(req, res){
//     console.log( req.params.id )
//     the_db = req.params.id;
//     mongoose.disconnect();
//     mongoose.connect('mongodb://localhost/' + the_db);
//     var db = mongoose.connection;
//     res.render('chat'); 
// });


app.get('/user/new', function(req,res){
    res.render('user_new', {message: ''});
});
app.post('/user/new', function(req,res){

    var n = req.body.username;
    var p = req.body.password;
    var pc = req.body.password_confirmation;

    if( !n || !p || !pc ){
        res.render('user_new', { message: 'Please fill out all fields.' });
    }

    var user = User.find({username: n}, function(error,user){
        if( user.length > 0 ){
            res.render('user_new', { message: 'Username already exists!' });
        } else {
            if( p != pc ) {
                res.render('user_new', { message: 'Passwords do not match.' });
            }
            var user = new User({ username: n, hashed_password: md5(p) });
            user.save(function (err) {
                if( !err ){
                    res.render('user_new', { message: 'New Users Created!' });
                } 
            });
        }
    });
});


app.get( '/login', function(req,res){
    res.render( 'login', { message: '' } );
    // res.end();
});


// app.get('/sessions', function(req,res){
//     Session.find({}, function(err,sessions){
//         res.json( sessions );
//     });
// });
app.post('/login', function(req,res){
    var username = req.body.username.toLowerCase();
    var password = md5(req.body.password);
    User.find({ username: username, hashed_password: password },function(err,user){
        if( !err && user.length > 0 ){
            res.redirect( '/admin');
        } else {
            res.render( 'login', { message: 'Invalid credentials'});
        }
    });
    // Session.find({}, function(err,sessions){
    //     res.json( sessions );
    // });
    // var logged_in = true;
    // if( logged_in ){
    //     res.redirect('/admin');
    // }
    // next();
});
app.get('/admin', function(req,res){
    var session = false;
    if( !session ){
        res.redirect('/login');
    }

});

// JSON.stringify( req.params )
app.get('/private/api_key/:id?', function( req, res ){
    var api_key = req.params;
    res.send(req._remoteAddress);
    res.end();
});


// API
app.get('/api/session/:id', function(req, res) {
    // Need to send user object as a var to use in client side
    User.find({ username: 'Richard' }, function(err, user){
        res.send( user );
    });
});

// 404 pages can be cool!
app.use(function(req, res, next){
    res.render('404');
});

/*
*
* Socket IO
*
*/
// Connection made to socket
io.on('connection', function(socket){


    socket.emit('your socket id', socket.id);

    // Send all messages to client as object
    Message.find({}).sort('date').limit(10).exec(function (err, messages) {
        if (err) return console.error(err);
        socket.emit('connected', messages);
    });


    // Someone sends a message
    socket.on('chat message', function(data){
        var sanitized_message = sanitizer.escape(data.message);
        var message = new Message({ name: data.username, message: sanitized_message });
        // Save Message to MongoDB
        message.save(function (err) {
            // Handle errors ***
            if( err ){
                io.emit('chat message', 'Something went wrong while saving your message');
            } else {
                // Send message to all sockets including yours!
                io.emit('chat message', { username: data.username, message: sanitized_message });
        console.log('SAVE MESSAGE')
            }
        });
    });

    socket.on('set username', function(username){
        var user = User.find({username: username });
        if( !user ){
            var user = new User({username: sanitizer.escape(username), socket_id: socket.id});
            user.save(function(err){
                if( !err ){
                    rbk_update_users_list();
                    io.emit('user joined', username);
                }
            });
        } else {
        // console.log(username)
            User.update({ id: username }, { username: username }, { multi: false }, function( err, doc ){
                console.log(err )
                if( !err ){

                }
            });
            rbk_update_users_list();
        }
    });
    socket.on('disconnect', function( res ){
        var user = User.find({socket_id:socket.id}, function(err,user){
            if( !err && user[0] ){
                io.emit('user left', user[0].username);
                User.remove({socket_id: socket.id}, function(err){
                    rbk_update_users_list();
                });
            } else {
                console.log( 'didn\'t find user' );
            }
        });
    });

    function rbk_update_users_list(  ){
        User.find({},function (err, users) {
            if( !err ){
                io.emit( 'update user list', users);
            }
        });
    }
}); // end io connect



// Start server
http.listen(port, function(){
    console.log('listening on port ' + port);
});

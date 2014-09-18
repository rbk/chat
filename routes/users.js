// auth start


app.get('/user/new', requireAuthentication, function(req,res){
    res.render('user_new', {message: ''});
});
app.post('/user/new', requireAuthentication, function(req,res){

    var n = req.body.username;
    var p = req.body.password;
    var pc = req.body.password_confirmation;
    if( !n || !p || !pc ){
        res.render('user_new', { message: 'Please fill out all fields.' });
        res.end();
    } else if( pc!=p ){
        res.render('user_new', { message: 'Passwords don\'t match.' });
        res.end();
    } else {
        var user = User.find({username: n}, function(error,user){
            if( user.length > 0 ){
                res.render('user_new', { message: 'Username already exists!' });
                res.end();
            } else {
                var user = new User({ username: n, hashed_password: md5(p) });
                user.save(function (err) {
                    if( !err ){
                        res.render('user_new', { message: 'New Users Created!' });
                        res.end();
                    } 
                });
            }
        });
    }
});


app.get( '/login', function(req,res){
    res.render( 'login', { message: '' } );
});


app.get('/sessions', function(req,res){
    Session.find({}, function(err,sessions){
        res.json( sessions );
    });
});

app.post('/login', function(req,res){
    
    var username = req.body.username.toLowerCase();
    var password = md5(req.body.password);
    var session_id = req.session.id;

    User.find({ username: username, hashed_password: password },function(err,user){

        if( !err && user.length > 0 ){

            // check for existing session
            UserSession.find({session_id: session_id}, function(err,user){
                if( user.length > 0 ){
                    res.redirect('admin');
                } else {
                    var session = new UserSession({ session_id: session_id, logged_in: true });
                    session.save(function(err){
                        if( !err ){
                            res.redirect('admin');
                        }
                    });
                }
            });

        
        } else {
            res.render( 'login', { message: 'Invalid credentials'});
        }
    });
});

app.get('/admin', requireAuthentication,function(req,res, next){
    res.render('admin');
    res.end();
});

app.get('/logout', function(req,res){
    UserSession.remove({ session_id: req.session.id }, function(err){
        if( !err ){
            res.render( 'login', { message: 'You are logged out.'});
        } else {
            res.send('Something went wrong.');
        }
    });
});



// auth end
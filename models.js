function define_models( mongoose ) {

	// DEFINE Collections/Models
	var UserSession = mongoose.model( 'UserSession', {
	    session_id: String,
	    logged_in: { type: Boolean, default: false } 
	});
	var User = mongoose.model( 'User', {
	    username: String,
	    hashed_password: String,
	    socket_id: String,
	    session_id: String,
	    message_count: Number,
	    logged_in: { type: Boolean, default: false } 
	});
	var Message = mongoose.model( 'Message', {
	    name: String,
	    message: String,
	    date: { type: Date, default: Date.now }
	});

	var Session = mongoose.model( 'Session', {
	    type: String,
	    name: String,
	    ip: String,
	    duration: Number,
	    logged_in: { type: Boolean, default: false } 
	});

}
module.exports = define_models;
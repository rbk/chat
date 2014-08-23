$(function(){
	var current_menu_item = localStorage.getItem( 'app-box-chat-menu' );
	if( current_menu_item ){
		$('#' + current_menu_item).css({'z-index':'9999'});
		$('a[href=#' + current_menu_item+']').parent('li').addClass('current');
	}
	// chat nav
	$('#app-box #header nav a').click(function(){
		var id = $(this).attr('href').replace('#', '');
		$('.page').css({'z-index':'1'});
		$('#app-box #header li').removeClass('current');
		$('#' + id).css({'z-index':'999'});
		$(this).parent('li').addClass('current');
		localStorage.setItem("app-box-chat-menu", id);
	});
	var current_room = localStorage.getItem( 'app-box-room-id' );

/*
*
*	Chat room logic
*
**/
	var socket = io();
	var nickname = 'richard';
	var message_tempate = $('#message-li').html();
	
	var cookie = $.cookie('rbk_chat');
	// socket.emit( 'set username', cookie);

	socket.on('your socket id', function(id){
		// console.log( 'Your socket id:' + id );
	});
	

	// Connected
	socket.on('connected', function (data) {
		if( $('#messages').length > 0 ){
			for( var i=0; i<data.length;i++ ){
				rbk_message( data[i].name, data[i].message );
			}
		}
	});


	// Send Message
	$('#send-message').click(function(){
		var message = $('#message').val();
		var username = $('#client_nickname').val();
		if( message.length > 0 ){
			socket.emit('chat message', {username: username, message: message });
			$('#message').val('');
		}
		return false;
	});


	// Receive Message
	socket.on('chat message', function(data){
		rbk_message( data.username, data.message );
		$('#message-board').scrollTop( $('#messages').height() + 100 )
	});


	function rbk_message( name, msg ){
		message_tempate = $('#message-li').html();
		message_tempate = message_tempate.replace('{{name}}', name );
		var new_message = message_tempate.replace('{{message}}', msg );
		$('#messages').append(new_message);
		$('#message-board').scrollTop( $('#messages').height() + 100 );
	}


	// If has cookie with user name then don't show modal // check for cookie on connection
	$.get('/session', function(session_id){
		if( session_id ){
			socket.emit('check user', session_id);
		}
	});


	socket.on( 'get nickname', function(user){
		if( user.newuser ){
			$('#chatModal').modal();
		} else {
			$('#user-list').append( '<li class="'+user.socket_id+'">'+user.username+'</li>' );
		}
	});


	socket.on( 'remove user', function(id){
		$('.'+id).remove();
		$('#messages').append( 
			message_tempate.replace('{{name}}', 'System' ).replace('{{message}}', 'Someone left??' ) 
		);

	});


// GOOD

	// Open modal
	if( cookie ) {
		$('#client_nickname').val( cookie );
		rbk_set_nickname();
	} else {
		$('#chatModal').modal();
	}
	// close modal on enter key
	$('#your_nickname').bind('keydown', function(e){
		if (e.keyCode == 13) {
			$('#chatModal').modal('hide');
		}
	});
	// Wait for theme to select a name
	$('#select-nickname').click(function(){
		$('#chatModal').modal('hide');
	});
	// Close modal and set name
	$('#chatModal').on('hidden.bs.modal', function () {
		rbk_set_nickname();
	});
	function rbk_set_nickname() {
		var your_nickname;
		// $('#chatModal').modal('hide');
		if( cookie ) {
			// your_nickname = $.cookie('rbk_chat', your_nickname, { expires: 7 });
			your_nickname = $.cookie('rbk_chat');
			// console.log( $.cookie('rbk_chat') )
		} else {
			console.log( 'no cookie found' )
			your_nickname = $('#your_nickname').val();
			$.cookie('rbk_chat', your_nickname, { expires: 7 });
		}
		if( your_nickname.length ){
			your_nickname = your_nickname;
		} else {
			your_nickname = 'Guest' + Math.floor(Math.random()*4000);
		}

		$('#client_nickname').val( your_nickname );
		socket.emit( 'set username', your_nickname);
		$('#message').focus();

		// console.log( your_nickname )
	}

	socket.on('update user list',function(users){
		console.log( users )
		$('#user-list li').remove();
		for( var i=0;i<users.length;i++ ){
			$('#user-list').append('<li>'+users[i].username+'</li>');
		}
		$('#message-board').scrollTop( $('#messages').height() + 100 );
	});
	socket.on('user joined',function(name){
		$('#messages').append('<li class="system">'+name+'&nbsp;joined.</li>')
	});
	socket.on('user left',function(name){
		$('#messages').append('<li class="system">'+name+'&nbsp;left.</li>')
	});

});





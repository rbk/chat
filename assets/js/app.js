$(function(){
/*
*
*	Chat room logic
*
**/
	var socket = io();
	var nickname = 'richard';
	var message_tempate = $('#message-li').html();
	var cookie = $.cookie('rbk_chat');

	socket.on('your socket id', function(id){
		// console.log( 'Your socket id:' + id );
	});
	

	// Connected
	socket.on('connected', function (data) {
		if( $('#messages').length > 0 ){
			for( var i=0; i<data.length;i++ ){
				rbk_message( data[i].name, data[i].message );
				// $('#messages').append( 
				// 	message_tempate.replace('{{name}}', data[i].nickname ).replace('{{message}}', data[i].message) 
				// );
			}
		}
	});


	// Send Message
	$('#send-message').click(function(){
		var message = $('#message').val();
		var nickname = $('#client_nickname').val();
		if( message.length > 0 ){
			socket.emit('chat message', {nickname: nickname, message: message });
			$('#message').val('');
		}
		return false;
	});


	// Receive Message
	socket.on('chat message', function(data){
		rbk_message( data.nickname, data.message );
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
			$('#user-list').append( '<li class="'+user.socket_id+'">'+user.nickname+'</li>' );
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

// GOOD
	socket.on('update user list',function(users){
		console.log( users )
		$('#user-list li').remove();
		for( var i=0;i<users.length;i++ ){
			$('#user-list').append('<li>'+users[i].nickname+'</li>');
		}
		$('#message-board').scrollTop( $('#messages').height() + 100 );
	});
	socket.on('user joined',function(name){
		// rbk_message( '<i>Server', name + ' joined.</i>' );
		$('#messages').append('<li style="background-color: #F3F3F3;padding: 0px 5px;color: #707070;">'+name+'&nbsp;joined.</li>')
	});
	socket.on('user left',function(name){
		// console.log( name );
		// rbk_message( '<i>Server', name + ' joined.</i>' );
		$('#messages').append('<li style="background-color: #FFDADA;padding: 0px 5px;color: #707070;">'+name+'&nbsp;left.</li>')
	});
/*
*
*
*
*	weird cursor thing
*
*
**/
	// Send your mouse position to all other sockets
	// window.onmousemove = handleMouseMove;
	// function handleMouseMove(event) {
	// 	event = event || window.event; // IE-ism
	// 	// console.log( event.clientX + ' ' + event.clientY );
	// 	socket.emit('mouse_position', { x: event.clientX, y: event.clientY } );
	// }
	// // Remove your cursor when you disconnect
	// socket.on( 'remove_cursor', function(id){
	// 	if( $('#' + id).length > 0 ){
	// 		$('#' + id).remove();
	// 	}
	// });
	// // Create your cursor for all other people and set position
	// socket.on( 'show_mouse', function(pos){
	// 	if( $('#' + pos.id).length == 0 ){
	// 		var cursor = document.createElement('i');
	// 		cursor.classList.add('fa');
	// 		cursor.classList.add('fa-bomb');
	// 		cursor.classList.add('cursor');
	// 		cursor.setAttribute("id", pos.id);
	// 		document.body.appendChild(cursor);
	// 	}
	// 	$('i#' + pos.id).css({
	// 		top : pos.y + Math.random() * 1000,
	// 		left : pos.x + Math.random() * 1000
	// 	});
	// });





});

(function(){
	var m = document.getElementById('rbk-chat-module');
	var key = m.getAttribute('key');
	var iframe = document.createElement('iframe');
	iframe.src='http://richardkeller.net:3001/chat/' + key;
	iframe.setAttribute('seamless','');
	m.parentNode.insertBefore(iframe, m.nextSibling);
	iframe.setAttribute('style','height:'+iframe.parentNode.offsetHeight+'px;width:100%;border:0;');
})();
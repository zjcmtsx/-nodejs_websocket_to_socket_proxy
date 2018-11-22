var ws = require("ws");
var net = require("net");

/*
	功能： 完成websocket和socket的转接
		客户端是websocket，服务端是socket，两者不能直接通信，
		所以这里用一个代理来进行转接，把websocket的内容转发到socket中
*/

var ws_server = new ws.Server({
	host: "127.0.0.1",
	port: 8883,
});


function websocket_add_listener(client_websock) {

	// 客户端websocket断开，则需要主动断开服务端的socket
	client_websock.on("close", function() {
		console.log("client close ",client_websock.client_id);

		if(client_websock.server_sock){
			client_websock.server_sock.end()
		}
	});

	client_websock.on("error", function(err) {
		console.log("client error", err);
	});
	
	
	// 客户端收到websocket发来的数据，直接把数据转发给服务端的socket
	client_websock.on("message", function(data) {
		//console.log("recv socket data --> websocket: ", data.toString("utf8"));

		if(client_websock.server_sock){
			client_websock.server_sock.write(data);
		}
	});
	
	
	// 创建和server的socket连接，这个socket挂载到客户端连上来的websocket上
	client_websock.server_sock = net.connect({
		port: 8884,
		host: "127.0.0.1",
	}, function() {
		console.log('socket connected to server!');
	});
	
	// 连接成功调用的事件
	client_websock.server_sock.on("connect",function() {
		console.log("tcp connect success");
	});
	// end

	// 有错误发生调用的事件
	client_websock.server_sock.on("error", function(e) {
		console.log("server socket error", e);
	});

	// socket关闭的事件
	client_websock.server_sock.on("close", function() {
		console.log("server socket close");
		client_websock.close();
	});


	// 对方发送了关闭数据包过来的事件
	client_websock.server_sock.on("end", function() {
		console.log("server socket end event");
	});


	// 服务端socket发来数据转发给客户端websocket
	client_websock.server_sock.on("data", function(data) {
		//console.log("socket data --> websocket:", data.toString("utf8"));
		if (client_websock.readyState == ws.OPEN) {
			client_websock.send(data);
		}
	});
}

var clientId = 0;

// 有客户端接入进来;
ws_server.on("connection", function (client_websock) {

	clientId += 1;
	client_websock.client_id = clientId
	console.log("client comming: ", client_websock.client_id);
	websocket_add_listener(client_websock);
});


ws_server.on("error", function (err) {
	
	
});


// headers事件, 回给客户端的字符。
ws_server.on("headers", function (data) {
	
	
});
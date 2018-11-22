var net = require("net");




var server = net.createServer(function(client_sock) { 

	var flag = false;
	var client_closed = false;
	
	console.log("client comming", client_sock.remoteAddress, client_sock.remotePort);
	
	client_sock.on("close", function() {
		console.log("close socket");
		client_closed = true;
	});
	
	
	
	client_sock.on("data", function(data) {
		console.log(data.toString("utf8"));
		
		//client_sock.write("goodbye!!!");

		//client_sock.end(); // 正常关闭
		/*
		if(!flag)
		{
			flag = true;
			var i = 0;
			var id = setInterval(function(){
				
				if(client_closed){
					clearInterval(id);
					return;
				}
				
				console.log("call Interval", i);
				
				i = i+1;
				client_sock.write("echo " + i);
				
			}, 1000)
		}
		*/
	});


	client_sock.on("error", function(err) {
		console.log("error", err);
	});
});

// 当我开始监听的时候就会调用这个回掉函数
server.on("listening", function() {
	console.log("start listening...");
});


// 监听发生错误的时候调用
server.on("error", function() {
	console.log("listen error");
});

server.on("close", function() {
	console.log("server stop listener");
});

server.listen({
	port: 8884,
	host: "127.0.0.1",
	exclusive: true,
});

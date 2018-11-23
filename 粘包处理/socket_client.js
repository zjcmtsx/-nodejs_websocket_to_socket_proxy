var net = require("net");

var port = 8001;
var host = '127.0.0.1';
var server_sock= new net.Socket();
//连接到服务端
server_sock.connect(port,host,function(){
    server_sock.write('start test...\n');// 这里必须带上回车符号
  });

// 连接成功调用的事件
server_sock.on("connect",function() {
    console.log("tcp connect success");
    
});
// end

// 有错误发生调用的事件
server_sock.on("error", function(e) {
    console.log("server socket error", e);
});

// socket关闭的事件
server_sock.on("close", function() {
    console.log("server socket close");
});


// 对方发送了关闭数据包过来的事件
server_sock.on("end", function() {
    console.log("server socket end event");
});


// 处理包内容
function deal_with_pkg (pkg){
    console.log("socket data :", pkg.toString("utf8"));
};

/**
 *  服务端socket发来数据转发给客户端websocket
 *  注意：由于是socket通信， 会存在粘包的问题， 这里需要处理一下
 *      服务端用的是skynet的netpack.pack，使用的是2字节标识长度的协议
 *      一个完整包的格式是：2字节长度信息 + data
 *                      这个长度信息仅仅指的是data的长度，不包括2字节长度在里面
 *                      即，一个包的总长度 = 2 + data.length
 * */
server_sock.on("data", function(data) {
    var new_data = data;

    // 如果上次有半包没处理完，那这次需要和新的数据合并在一起进行处理
    if(server_sock.uncomplete_pkg != null){
        var total_len = server_sock.uncomplete_pkg.length + data.length;
        new_data = Buffer.concat([server_sock.uncomplete_pkg, data], total_len);
        server_sock.uncomplete_pkg = null;
    }

    // 如果数据连2字节长度都不够，也就是长度信息都解析不出来，那肯定是不完整的包
    if(new_data.length < 2){
        server_sock.uncomplete_pkg = new_data;
        return;
    }

    // 循环解析包
    var offset = 0;
    while (new_data.length - offset >= 2) {
        var len = new_data.readInt16BE();// 2字节长度
        var left_data_len = new_data.length - offset;

        // 剩下的数据不是整包，则缓存到server_sock.uncomplete_pkg，等待下次处理
        if(left_data_len < (len + 2)){
            var pkg_buf = Buffer.allocUnsafe(left_data_len);
            new_data.copy(pkg_buf, 0, offset, new_data.length)
            server_sock.uncomplete_pkg = pkg_buf;
            return;
        }
        
        // 读取一个整包的数据部分
        var pkg_buf = Buffer.allocUnsafe(len);
        new_data.copy(pkg_buf, 0, offset+2, offset+2+len);

        // 处理每个包的内容
        deal_with_pkg(pkg_buf);
        
        offset += (2 + len);
    }
});
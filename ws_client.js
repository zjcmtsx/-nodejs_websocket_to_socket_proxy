var ws = require("ws")

var sock = new ws("ws://127.0.0.1:8883")

sock.on("open", function (){
    console.log("connect success!")
	sock.send("hello");
	sock.send("hello1");
	sock.send("hello2");
})


sock.on("close", function (){
    console.log("socket closed")
})


sock.on("message", function (data){
    console.log(data.toString("utf8"))
})


sock.on("error", function (err){
    console.log(err)
})
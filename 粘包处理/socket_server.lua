local skynet = require("skynet")
local socket = require("skynet.socket")
local netpack = require "skynet.netpack"

local function echo(client_fd, addr)
    socket.start(client_fd)

    local str = socket.readline(client_fd)
    if str then
        skynet.error("recv: ", str)
        skynet.fork(function() 
            local i = 0
            while true do
                socket.write(client_fd, netpack.pack("hellow nodejs"))
                i = i + 1
                skynet.sleep(1)
            end
        end)
        
    else
        skynet.error("disconnect")
        socket.close(client_fd)
    end
end

local function accept(client_fd, addr)
    skynet.fork(echo, client_fd, addr) --来一个连接，就开一个新的协程来处理客户端数据
end

skynet.start(function () 
    local fd = assert(socket.listen("0.0.0.0:8001"))

    socket.start(fd, accept)

end)
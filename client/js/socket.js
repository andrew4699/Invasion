var io = require("socket.io-client");

// Constants

// Variables

// Functions

function initialize(name)
{
    if(!Player.socket || !Player.socket.connected)
    {
    	Player.socket = io({query: "name=" + name});
        bindSocketEvents(Player.socket);
    }
}

function bindSocketEvents(socket)
{
    socket.on("connect_failed", function()
    {
    	socket.close();
    });

    socket.on("disconnect", function()
    {
    	socket.close();
        socket.off();
    });

    socket.on("connected", function(data)
    {
        if(data.success)
        {
            $('#connect').hide();
            $('#game').show();

            Game.initialize();
        }
        else
        {
            $('#do_connect').prop("disabled", false);
            alert("That name is already in use.");
        }
    });

    socket.on("update", function(data)
    {
        Player.onServerUpdate(data);
    });

    socket.on("sendNotification", function(data)
    {
        Player.onNotification(data);
    });

    socket.on("setCookie", function(data)
    {
        console.log(data);
        setCookie(data.name, data.value, 30);
    });

    socket.on("clearCookie", function(cookie)
    {
        setCookie(cookie, 0);
    });
}
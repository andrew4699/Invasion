"use strict";

global.clearConsole = function()
{
	process.stdout.write("\x1Bc");
}

global.print = function(message)
{
	if(typeof message == "string")
	{
		var date = new Date();
		var hours = date.getHours();
		var minutes = date.getMinutes();
		var seconds = date.getSeconds();

		if(hours < 10)
			hours = "0" + hours;

		if(minutes < 10)
			minutes = "0" + minutes;

		if(seconds < 10)
			seconds = "0" + seconds;

		var timestamp = "[" + hours + ":" + minutes + ":" + seconds + "]";

		message = timestamp + " " + message;
	}

	console.log(message);
}

global.println = function(message)
{
	print(message);
	console.log("");
}

global.getTime = function()
{
	return Math.floor(Date.now() / 1000);
}

global.getTimeMS = function()
{
	return Date.now();
}

global.validateEmail = function(email)
{
	return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email);
}

global.distance2D = function(pointOne, pointTwo)
{
    var a = pointTwo.x - pointOne.x;
    var b = pointTwo.y - pointOne.y;

    return Math.sqrt((a * a) + (b * b));
}

global.rectCollision = function(a, b)
{
	return ((a.x + a.width) > b.x && a.x < (b.x + b.width)) && ((a.y + a.height) > b.y && a.y < (b.y + b.height));
}

global.safeObject = function(object)
{
	var safe = {};

	for(var property in object)
	{
		if(object.hasOwnProperty(property))
		{
			if(property != "hidden" && typeof object[property] != "function")
			{
				safe[property] = object[property];
			}
		}
	}

	return safe;
}
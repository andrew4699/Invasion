// Constructor
function Player(socket)
{
	this.private = {};
	this.private.socket = socket;

	this.name = socket.request._query['name'];
	this.admin = false;

	this.private.lastWeaponShot = 0;
}

global.Player = Player;

// Callbacks
Player.prototype.onConnect = function()
{
	var duplicateFound = false;

	for(var i = 0; i < players.length; i++)
	{
		if(players[i].name == this.name && players[i] != this)
		{
			duplicateFound = true;
			break;
		}
	}

	if(this.name.length < constants.MIN_PLAYER_NAME || this.name.length > constants.MAX_PLAYER_NAME || duplicateFound)
	{
		print(this.getMessagePrefix() + " connection rejected due to duplicate name");
		this.emit("connected", {success: false});
		this.private.socket.disconnect();
	}
	else
	{
		players.push(this);

		print(this.getMessagePrefix() + " has connected");
		this.emit("connected", {success: true});

		this.spawn();
	}
};

Player.prototype.onDisconnect = function()
{
	for(var i = 0; i < players.length; i++)
	{
		if(players[i] == this)
		{
			players.splice(i, 1);
		}
	}

	print(this.getMessagePrefix() + " has disconnected");	
};

Player.prototype.onSendHeartbeat = function(data)
{
	this.position = data.position;
	this.rotation = data.rotation;

	this.sendUpdate();
};

Player.prototype.onShoot = function()
{
	if(getTimeMS() - this.private.lastWeaponShot >= this.weapon.fireDelay)
	{
		this.weapon.shoot();
		this.private.lastWeaponShot = getTimeMS();
	}
};

Player.prototype.onReload = function()
{
	this.weapon.reload();
};

Player.prototype.onConsoleCommand = function(command, params)
{
	if(command == "auth")
	{
		if(params[0] && params[0] == config.authPass)
		{
			this.admin = true;
			this.sendNotification("success", "Logged in as admin");

			if(params[1] && params[1] == 1)
			{
				this.private.socket.emit("setCookie", {name: "auth_password", value: config.authPass});
			}
		}
	}
	else if(command == "deauth" && this.admin)
	{
		this.admin = false;
		this.sendNotification("warning", "Removed admin privileges");

		if(params[0] && params[0] == 1)
		{
			this.private.socket.emit("clearCookie", "auth_password");
		}
	}
	else if(command == "give" && this.admin)
	{
		var weapon, input = params[0].toLowerCase();

		if(input == "pistol")
			weapon = new Pistol();
		else if(input == "ak47")
			weapon = new AK47();
		else return this.sendNotification("error", "Invalid weapon (" + input + ")")

		this.giveWeapon(weapon);
		this.sendNotification("success", "Given (" + input + ")");
	}
	else if(command == "ammo" && this.admin)
	{
		this.weapon.ammo = 999;
		this.sendNotification("success", "Given ammo");
	}
};

// Functions

Player.prototype.emit = function(message, data)
{
	this.private.socket.emit(message, data);
};

Player.prototype.getIP = function()
{
	return this.private.socket.handshake.address;
};

Player.prototype.getMessagePrefix = function()
{
	return this.name + " (IP: " + this.getIP() + ")";
};

Player.prototype.getFilteredObject = function()
{
	var data = {};

	for(var property in this)
	{
		if(this.hasOwnProperty(property) && property != "private")
		{
			data[property] = this[property];
		}
	}

	return data;
};

Player.prototype.sendUpdate = function()
{
	var data = {self: this.getFilteredObject(), players: []};

	for(var i = 0; i < players.length; i++)
	{
		if(players[i] != this)
		{
			data.players.push(players[i].getFilteredObject());
		}
	}

	this.private.socket.emit("update", data);
};

Player.prototype.spawn = function()
{
	this.setHealth(100);
	this.giveWeapon(new Pistol());
};

Player.prototype.setHealth = function(health)
{
	this.health = health;
};

Player.prototype.giveWeapon = function(weapon)
{
	this.weapon = weapon;
};

Player.prototype.sendNotification = function(type, message)
{
	this.private.socket.emit("sendNotification", {type: type, message: message});
};

// Constants
constants.MIN_PLAYER_NAME = 2;
constants.MAX_PLAYER_NAME = 16;
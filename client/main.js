$(document).on("ready", function()
{
	function doConnect()
	{
		var chosenName = $('#connect_name').val();

		if(chosenName.length >= 2 && chosenName.length <= 16)
		{
			if(chosenName.indexOf(' ') == -1)
			{
				$('#do_connect').prop("disabled", true);
				initialize(chosenName);
			}
			else alert("Your name may not contain spaces.");
		}
		else alert("Your name must be between 2-16 characters.");
	}

	$('#do_connect').on("click", function()
	{
		doConnect();
	});

	$('#connect_name').on("keyup", function(event)
	{
		if(event.keyCode == 13)
		{
			doConnect();
		}
	});
});var KEY_UP = 38;
var KEY_DOWN = 40;

var Console =
{
	initialize: function()
	{
		Console.elements = {};
		Console.elements.main = $('#console');
		Console.elements.input = $('#consoleInput');
		Console.elements.output = $('#consoleOutput');

		$(document).on("keyup", function(event)
		{
        	if(event.keyCode == 192)
        	{
        		Console.toggleDisplay();
        	}
		});

		Console.elements.input.on("keyup", function(event)
		{
			if(event.keyCode == 13)
			{
				Console.onInput($(this).val());
				$(this).val("");
			}
			else if(event.keyCode == KEY_UP)
			{
				if(Console.historyLocation == -1)
					Console.historyLocation = Console.commandHistory.length - 1;
				else
				{
					Console.historyLocation--;

					if(Console.historyLocation < 0)
						Console.historyLocation = 0;
				}

				Console.updateHistory();
			}
			else if(event.keyCode == KEY_DOWN)
			{
				if(Console.historyLocation != -1)
				{
					Console.historyLocation++;

					if(Console.historyLocation > Console.commandHistory.length - 1)
						Console.historyLocation = Console.commandHistory.length - 1;
				}

				Console.updateHistory();
			}
			else
			{
				Console.historyLocation = -1;
			}
		});

		Console.log("Console initialized");
	},
	commandHistory: [],
	historyLocation: -1,
	updateHistory: function()
	{
		Console.elements.input.val(Console.commandHistory[Console.historyLocation]);
	},
	toggleDisplay: function()
	{
		Console.elements.main.toggle();

		if(Console.elements.main.is(":visible"))
		{
			Console.elements.input.val("").focus();

			document.exitPointerLock = document.exitPointerLock || document.msExitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock;
			document.exitPointerLock();
		}
		else
		{
			Game.canvas.requestPointerLock();
			Game.canvas.focus();
		}
	},
	log: function(text)
	{
		if(!isNaN(text))
			text = text.toString();

		text = text.replace("{{", "<span>");
		text = text.replace("}}", "</span>");

		Console.elements.output.append("<div>" + text + "</div>");
	},
	onInput: function(text)
	{
		Console.commandHistory.push(text);

		var params = [];
		var stringStart = -1;
		input = text.split(" ");

		for(var i = 1; i < input.length; i++)
		{
			if(input[i].charAt(0) == '"' && stringStart == -1) // Start of string
			{
				if(input[i].charAt(input[i].length - 1) == '"') // String in one parameter
				{
					params.push(input[i].substring(1, input[i].length - 1));
				}
				else stringStart = i;
			}
			else if(input[i].charAt(input[i].length - 1) == '"' && stringStart != -1) // End of string
			{
				var result = input.slice(stringStart, i + 1).join(" ");
				params.push(result.substring(1, result.length - 1));
				stringStart = -1;
			}
			else if(stringStart == -1)
			{
				if(isNaN(input[i])) // Unquoted string
					params.push(input[i]);
				else // Number
					params.push(parseInt(input[i]));
			}
		}

		Console.onCommand(input[0], params);

		Console.log("{{" + input[0] + "}} " + params.map(function(value)
		{
			if(typeof value == "string")
				return "\"" + value + "\"";
			else
				return value;
		}).join(" "));
	},
	onCommand: function(command, params)
	{
		Player.socket.emit("consoleCommand", {cmd: command, args: params});
	}
};// General

function random(min, max)
{
	return Math.floor(Math.random() * (max - min + 1) + min);
}

String.prototype.capitalizeFirstLetter = function()
{
    return this.charAt(0).toUpperCase() + this.slice(1);
}

function distance2D(pointOne, pointTwo)
{
    var a = pointTwo.x - pointOne.x;
    var b = pointTwo.y - pointOne.y;

    return Math.sqrt((a * a) + (b * b));
}

function getTime()
{
    return Math.floor(Date.now() / 1000);
}

function getTimeMS()
{
    return Date.now();
}

function rectCollision(a, b)
{
    return ((a.x + a.width) > b.x && a.x < (b.x + b.width)) && ((a.y + a.height) > b.y && a.y < (b.y + b.height));
}

// Cookies

function setCookie(cname, cvalue, exdays)
{
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));

    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname)
{
    var name = cname + "=";
    var ca = document.cookie.split(';');

    for(var i = 0; i < ca.length; i++)
    {
        var c = ca[i];

        while(c.charAt(0) == ' ')
        {
            c = c.substring(1);
        }

        if(c.indexOf(name) == 0) 
        {
            return c.substring(name.length, c.length);
        }
    }

    return "";
}var Game =
{
	initialize: function()
	{
		this.canvas = $('#gameCanvas')[0];

		this.engine = new BABYLON.Engine(this.canvas, true);
		
		BABYLON.SceneLoader.Load("scenes/espilit/", "espilit.babylon", this.engine, function(scene)
		{
            scene.executeWhenReady(function()
            {
            	Game.scene = scene;

            	Game.adjustCameraSettings(scene.activeCamera);
                Game.initPointerLock(Game.canvas);

                Player.initialize(scene);
                Console.initialize();

                $('#gameCanvas').on("keyup", function(event)
                {
                	if(event.keyCode == 32)
                	{
                		Player.jump();
                	}
                	else if(event.keyCode == 82)
                	{
                		Player.reload();
                	}
                });

                window.addEventListener("resize",function()
                {
                	Game.engine.resize();
                });

                // Load assets
                var am = new BABYLON.AssetsManager(scene);
                Game.initWeapons(am);
				am.load();

				// Render
                Game.engine.runRenderLoop(function()
                {
                    scene.render();
                });

                // Auto admin login
                var storedPassword = getCookie("auth_password");

                if(storedPassword)
                {
                	Player.socket.emit("consoleCommand", {cmd: "auth", args: [storedPassword]});
                }
            });
        },
        function(progress)
        {
            // To do: give progress feedback to user
        });
	},
	weapons:
	{
		"Pistol":
		{
			folder: "pistol/",
			model: "gun-pbribl",
			positionOffset: [0.5, -0.5, 1],
			rotationOffset: [0, Math.PI * 1.05, 0],
			shootPositionOffset: [0, 0, -0.375],
			reloadRotationOffset: [-0.75, 0, 0],
			scale: [0.02, 0.02, 0.02],
			shootAnimationTime: 125
		},
		"AK47":
		{
			folder: "ak47/",
			model: "ak-47-kalashnikov",
			positionOffset: [0.65, -0.5, 0.8],
			rotationOffset: [0, 0, 0],
			shootPositionOffset: [0, 0, -0.375],
			reloadRotationOffset: [-0.15, 0, 0],
			scale: [0.05, 0.05, 0.05],
			shootAnimationTime: 125
		}
	},
	assets: {},
	initMesh : function(task)
	{
	    Game.assets[task.name] = task.loadedMeshes;

	    for (var i = 0; i < task.loadedMeshes.length; i++)
	    {
	        var mesh = task.loadedMeshes[i];
	        mesh.isVisible = false;
	    }
	},
	initPointerLock: function(canvas)
	{
		Game.engine.isPointerLock = true;

	    // On click event, request pointer lock
	    canvas.addEventListener("click", function(evt) {
	        canvas.requestPointerLock = canvas.requestPointerLock || canvas.msRequestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
	        if (canvas.requestPointerLock)
	        {
	            canvas.requestPointerLock();
	        }
	    }, false);

	    // Event listener when the pointerlock is updated (or removed by pressing ESC for example).
	    var onPointerLockChange = function (event)
	    {
	        Game.controlEnabled = (
	                           document.mozPointerLockElement === canvas
	                        || document.webkitPointerLockElement === canvas
	                        || document.msPointerLockElement === canvas
	                        || document.pointerLockElement === canvas);
	        // If the user is alreday locked
	        if (!Game.controlEnabled) {
	            Game.scene.activeCamera.detachControl(canvas);
	        } else {
	            Game.scene.activeCamera.attachControl(canvas);
	        }
	    };

	    // Attach events to the document
	    document.addEventListener("pointerlockchange", onPointerLockChange, false);
	    document.addEventListener("mspointerlockchange", onPointerLockChange, false);
	    document.addEventListener("mozpointerlockchange", onPointerLockChange, false);
	    document.addEventListener("webkitpointerlockchange", onPointerLockChange, false);
	},
	initWeapons: function(am)
	{
		for(var weapon in Game.weapons)
		{
			if(Game.weapons.hasOwnProperty(weapon))
			{
				var meshTask = am.addMeshTask(weapon, "", "assets/" + Game.weapons[weapon].folder, Game.weapons[weapon].model + ".babylon");

				meshTask.onSuccess = function(task)
				{
					Game.initMesh(task);
					
					for(var i = 0; i < Game.assets[task.name].length; i++)
					{
						Game.assets[task.name][i].parent = Player.camera;
						Game.assets[task.name][i].rotationQuaternion = null;

						var p = Game.weapons[task.name].positionOffset;
						Game.assets[task.name][i].position = new BABYLON.Vector3(p[0], p[1], p[2]);

						var r = Game.weapons[task.name].rotationOffset;
						Game.assets[task.name][i].rotation = new BABYLON.Vector3(r[0], r[1], r[2]);

						var s = Game.weapons[task.name].scale;
						Game.assets[task.name][i].scaling = new BABYLON.Vector3(s[0], s[1], s[2]);

						Game.assets[task.name][i].isVisible = false;
					}
				}
			}
		};
	},
	adjustCameraSettings: function(camera)
	{
		camera.attachControl(Game.canvas);
        camera.angularSensibility = 850;
        camera.inertia = 0;
       	camera.speed = 1.75;

       	// WASD
        camera.keysUp.push(87);
        camera.keysDown.push(83);
        camera.keysLeft.push(65);
        camera.keysRight.push(68);

        //camera.applyGravity = false;
	}
};var NOTIFICATION_HIDE_TIME = 3000;

function Notification(type, message)
{
	this.text = message;

	this.element = $("<div class='" + type + "'>" + message + "</div>");
	this.element.appendTo("#notifications");

	this.hideTimer = setTimeout(this.fadeNotification.bind(this), NOTIFICATION_HIDE_TIME);
}

Notification.prototype.fadeNotification = function()
{
	this.element.fadeOut(2000, function()
	{
		this.remove();
	});
};var Player =
{
	initialize: function(scene)
	{
		Player.scene = scene;
		Player.camera = scene.activeCamera;

		$('#gameCanvas').on("click", function()
		{
			Player.shoot();
		});

		setInterval(Player.onUpdate, 20);
		setInterval(Player.onHeartbeat, 20);
	},
	onUpdate: function()
	{
		if(typeof Player.serverData.weapon != "undefined")
		{
			var wData = Game.weapons[Player.serverData.weapon.name];

			// Shooting animation
			var timePassed = getTimeMS() - Player.shootAnimationStart;

			if(timePassed < wData.shootAnimationTime)
			{
				var offset = wData.shootPositionOffset.map(function(value)
			    {
			    	var halfAnimationTime = wData.shootAnimationTime / 2;
				    return value * (1 - (Math.abs(timePassed - halfAnimationTime) / halfAnimationTime));
			    });

			    for(var i = 0; i < Game.assets[Player.serverData.weapon.name].length; i++)
			    {
			    	Game.assets[Player.serverData.weapon.name][i].position.x = wData.positionOffset[0] + offset[0];
			    	Game.assets[Player.serverData.weapon.name][i].position.y = wData.positionOffset[1] + offset[1];
			    	Game.assets[Player.serverData.weapon.name][i].position.z = wData.positionOffset[2] + offset[2];
				}
			}
			else if(!Player.shootAnimationReset)
			{
				Player.resetWeaponAnimation();
				Player.shootAnimationReset = true;
			}

			// Reloading animation
			var timePassed = getTimeMS() - Player.reloadAnimationStart;

			if(timePassed < Player.serverData.weapon.reloadTime)
			{
				var offset = wData.reloadRotationOffset.map(function(value)
			    {
			    	var halfAnimationTime = Player.serverData.weapon.reloadTime / 2;
				    return value * (1 - (Math.abs(timePassed - halfAnimationTime) / halfAnimationTime));
			    });

			    for(var i = 0; i < Game.assets[Player.serverData.weapon.name].length; i++)
			    {
			    	Game.assets[Player.serverData.weapon.name][i].rotation.x = wData.rotationOffset[0] + offset[0];
			    	Game.assets[Player.serverData.weapon.name][i].rotation.y = wData.rotationOffset[1] + offset[1];
			    	Game.assets[Player.serverData.weapon.name][i].rotation.z = wData.rotationOffset[2] + offset[2];
				}
			}
			else if(!Player.reloadAnimationReset)
			{
				Player.resetWeaponAnimation();
				Player.reloadAnimationReset = true;
			}
		}
	},
	onHeartbeat: function() // Data sent to server
	{
		Player.socket.emit("sendHeartbeat", {position: Player.camera.position, rotation: Player.camera.rotation});
	},
	onServerUpdate: function(data) // Data received from server
	{
		//console.log(data.players);
		if(typeof Player.serverData.weapon != "undefined")
		{
			if(Player.serverData.weapon.name != data.self.weapon.name)
			{
				// Hide old weapon
				for(var i = 0; i < Game.assets[Player.serverData.weapon.name].length; i++)
				{
					Game.assets[Player.serverData.weapon.name][i].isVisible = false;
				}

				// Show new weapon
				for(var i = 0; i < Game.assets[data.self.weapon.name].length; i++)
				{
					Game.assets[data.self.weapon.name][i].isVisible = true;
				}
			}
		}
		else // Show weapon (first time)
		{
			for(var i = 0; i < Game.assets[data.self.weapon.name].length; i++)
			{
				Game.assets[data.self.weapon.name][i].isVisible = true;
			}
		}

		Player.serverData = data.self;
		Player.updateHUD();
	},
	onNotification: function(data)
	{
		new Notification(data.type, data.message);
	},
	serverData: {},
	jumping: false,
	jump: function()
	{
		if(!Player.jumping)
		{
			Player.jumping = true;

			Player.riseInterval = setInterval(function()
			{
				Player.camera.position.y += 0.02;
			}, 5);

			setTimeout(function()
			{
				clearInterval(Player.riseInterval);

				Player.fallInterval = setInterval(function()
				{
					Player.camera.position.y -= 0.02;

					if(Player.camera.position.y < 1.80449986)
						Player.camera.position.y = 1.80449986;
				}, 5);

				setTimeout(function()
				{
					clearInterval(Player.fallInterval);
					Player.jumping = false;
				}, 500);
			}, 500);
		}
	},
	shoot: function()
	{
		if(Player.serverData.weapon.ammo >= Player.serverData.weapon.ammoPerShot && getTimeMS() - Player.serverData.weapon.reloadStart >= Player.serverData.weapon.reloadTime) // Check for enough ammo and that the person isn't reloading
		{
			if(getTimeMS() - Player.serverData.lastWeaponShot >= Player.serverData.weapon.fireDelay) // Fire delay
			{
				/*var width = Player.scene.getEngine().getRenderWidth();
				var height = Player.scene.getEngine().getRenderHeight();*/
				var width = $(window).width();
				var height = $(window).height();

				var pickInfo = Player.scene.pick(width / 2, height / 2, null, false, Player.camera);
				Player._performShoot(pickInfo);
			}
		}
	},
	_performShoot: function(pickInfo)
	{
        var b = BABYLON.Mesh.CreateBox("box", 0.1, Player.scene);
        b.position = pickInfo.pickedPoint.clone();

        Player.animateWeaponShoot();

        Player.socket.emit("shoot");
        Player.serverData.weapon.ammo -= Player.serverData.weapon.ammoPerShot;
	},
	animateWeaponShoot: function()
	{
		//Player.resetWeaponAnimation();
		Player.shootAnimationReset = false;
		Player.shootAnimationStart = getTimeMS();
	},
	animateWeaponReload: function()
	{
		//Player.resetWeaponAnimation();
		Player.reloadAnimationReset = false;
		Player.reloadAnimationStart = getTimeMS();
	},
	resetWeaponAnimation: function()
	{
		for(var i = 0; i < Game.assets[Player.serverData.weapon.name].length; i++)
	    {
	    	var p = Game.weapons[Player.serverData.weapon.name].positionOffset;
	    	Game.assets[Player.serverData.weapon.name][i].position = new BABYLON.Vector3(p[0], p[1], p[2]);

	    	var r = Game.weapons[Player.serverData.weapon.name].rotationOffset;
	    	Game.assets[Player.serverData.weapon.name][i].rotation = new BABYLON.Vector3(r[0], r[1], r[2]);
	    }
	},
	reload: function()
	{
		if(Player.serverData.weapon.ammo < Player.serverData.weapon.clipSize)
		{
			Player.animateWeaponReload();
			Player.socket.emit("reload");
		}
	},
	updateHUD: function()
	{
		$('#health-value').text(Player.serverData.health);

		$('#ammo-current-value').text(Player.serverData.weapon.ammo);
		$('#ammo-clipsize-value').text("/" + Player.serverData.weapon.clipSize);
	}
};var io = require("socket.io-client");

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
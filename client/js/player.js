var Player =
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
};
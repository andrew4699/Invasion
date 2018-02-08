var Game =
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
};
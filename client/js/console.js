var KEY_UP = 38;
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
};
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
});
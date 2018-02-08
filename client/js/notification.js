var NOTIFICATION_HIDE_TIME = 3000;

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
};
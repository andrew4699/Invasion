// Constructor
function AK47()
{
	Weapon.call(this);

	this.name = "AK47";

	this.damage = 15;

	this.clipSize = 30;
	this.ammo = this.clipSize;

	this.fireType = constants.WEAPON_FIRE_AUTOMATIC;
	this.fireDelay = 100;

	this.reloadTime = 2200;
}

AK47.prototype = Object.create(Weapon.prototype);
global.AK47 = AK47;
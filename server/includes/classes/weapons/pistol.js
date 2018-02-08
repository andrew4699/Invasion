// Constructor
function Pistol()
{
	Weapon.call(this);

	this.name = "Pistol";

	this.damage = 20;

	this.clipSize = 12;
	this.ammo = this.clipSize;

	this.fireType = constants.WEAPON_FIRE_MANUAL;
	this.fireDelay = 300;

	this.reloadTime = 800;
}

Pistol.prototype = Object.create(Weapon.prototype);
global.Pistol = Pistol;
// Constructor
function Weapon()
{
	this.name = "Unnamed Weapon";

	this.ammoPerShot = 1;

	this.reloadStart = 0;
}

global.Weapon = Weapon;

// Functions
Weapon.prototype.shoot = function()
{
	if(this.ammo >= this.ammoPerShot && getTimeMS() - this.reloadStart >= this.reloadTime) // Check for enough ammo and that the person isn't reloading
	{
		this.ammo -= this.ammoPerShot;
	}
};

Weapon.prototype.reload = function()
{
	if(this.ammo < this.clipSize)
	{
		this.reloadStart = getTimeMS();
		this.ammo = this.clipSize;
	}
};

// Constants
constants.WEAPON_FIRE_MANUAL = 1;
constants.WEAPON_FIRE_AUTO = 2;

// Weapons
require("./weapons/pistol");
require("./weapons/ak47");
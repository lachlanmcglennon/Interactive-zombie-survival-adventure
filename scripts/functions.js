//This file contains general purpose functions used throughout the code.

function getAngleInRadians(p1, p2) {
    //Gets the angle between 2 PIXI.Point values, and returns it, in radians.
    return Math.atan2(p2.y - p1.y, p2.x - p1.x)
}

function setAccelToPoint(source, target, speed) {
    //Returns the accel to move to a given point by a given speed.
    var res = new PIXI.Point();
    res.x = speed * Math.cos(getAngleInRadians(source, target));
    res.y = speed * Math.sin(getAngleInRadians(source, target));
    return res;
}

function moveToPoint(source, target, distance) {
    //Returns the position after moving distance amount to the target.
    var res = new PIXI.Point();
    res.x = source.x + distance * Math.cos(getAngleInRadians(source, target));
    res.y = source.y + distance * Math.sin(getAngleInRadians(source, target));
    return res;
}

function setAccelInDirection(direction, speed) {
    //Returns the accel to move along a given direction by a given speed.
    var res = new PIXI.Point();
    res.x = speed * Math.cos(direction);
    res.y = speed * Math.sin(direction);
    return res
}

function toRadians(degrees) {
    return (degrees * Math.PI)/180;
}

function getPlayerColour() {
    var colour = document.getElementById("playerCol");
    return colour.value.replace("#", "0x");
}

function decimalToHexString(number)
{
    if (number < 0)
    {
        number = 0xFFFFFFFF + number + 1;
    }

    return number.toString(16).toUpperCase();
}

function genRandomColour() {
    return "0x" + decimalToHexString(Math.floor(255 * Math.random())) + 
    decimalToHexString(Math.floor(255 * Math.random())) + 
    decimalToHexString(Math.floor(255 * Math.random()));
}

function getDistanceFrom(p1, p2) {
    return Math.sqrt(Math.pow(Math.abs(p1.x - p2.x), 2) + Math.pow(Math.abs(p1.y - p2.y), 2));
}

function updateUI () {
    var enemyHP = document.getElementById("curEnemyHP");
    if (app.enemies.length > 0) {
        enemyHP.innerHTML = "Current enemy HP:" + app.enemies[0].armour.curHP.toFixed(2);
    }
    document.getElementById("curPlayerHP").innerHTML = "Current player HP: " + app.player.armour.curHP.toFixed(2);
    document.getElementById("curWave").innerHTML = "Wave: " + app.wave.number;
    document.getElementById("curPower").innerHTML = "Enemy Power: " + app.power.toFixed(2);
    document.getElementById("curMoney").innerHTML = "Money: " + app.money.curMoney.toFixed(2);
    document.getElementById("curMoneyGainRate").innerHTML = "Money Per Second: " + app.money.highestMoneyGainRate.toFixed(2);
    
    
}

function newWeapon() {
    app.player.weapon = new Weapon(app.player, app.money.curMoney);
    app.money.curMoney = 0;
}

function newArmour() {
    app.player.armour = new Armour(app.player, app.money.curMoney);
    app.money.curMoney = 0;
}
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

function moveInDirection(source, distance, direction) {
    //Returns the accel to move to a given point by a given speed.
    var res = new PIXI.Point();
    res.x = source.x + distance * Math.cos(direction);
    res.y = source.y + distance * Math.sin(direction);
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
    return (degrees * Math.PI) / 180;
}

function getDistanceFrom(p1, p2) {
    return Math.sqrt(Math.pow(Math.abs(p1.x - p2.x), 2) + Math.pow(Math.abs(p1.y - p2.y), 2));
}

function circularCollision(eSize1, eSize2, ePos1, ePos2) {
    if (getDistanceFrom(ePos1, ePos2) < eSize1 + eSize2) {
        return true;
    } else {
        return false;
    }
}

function genBoxSprite(width, height, lineWidth, lineColour, fillColour) {
    var box = new PIXI.Graphics();
    box.lineStyle(lineWidth, lineColour);
    box.beginFill(fillColour);
    box.drawRect(0, 0, width, height);
    box.endFill();
    box = new PIXI.Sprite(app.renderer.generateTexture(box));
    return box;
}

function getPlayerColour() {
    var colour = document.getElementById("playerCol");
    return colour.value.replace("#", "0x");
}

function decimalToHexString(number) {
    if (number < 0) {
        number = 0xFFFFFFFF + number + 1;
    }

    return number.toString(16).toUpperCase();
}

function genRandomColour() {
    return "0x" + decimalToHexString(Math.floor(255 * Math.random())) +
        decimalToHexString(Math.floor(255 * Math.random())) +
        decimalToHexString(Math.floor(255 * Math.random()));
}

function collidingWithWallX(pos, size) {
    if (pos.x > app.wall.position.x + app.wall.width) {
        return true;
    }

    if (pos.x < app.wall.position.x) {
        return true;
    }
    return false;
}

function collidingWithWallY(pos) {
    if (pos.y > app.wall.position.y + app.wall.height) {
        return true;
    }

    if (pos.y < app.wall.position.y) {
        return true;
    }
    return false;
}

function collidingWithWall(pos) {
    return (collidingWithWallX(pos) || collidingWithWallY(pos));
}

function updateUI() {
    var enemyHP = document.getElementById("curEnemyHP");
    if (app.enemies.length > 0) {
        enemyHP.innerHTML = "Current enemy HP:" + app.enemies[0].armour.curHP.toFixed(2);
    }
    document.getElementById("curPlayerHP").innerHTML = "Current player HP: " + app.player.armour.curHP.toFixed(2);
    document.getElementById("curPlayerWeapon").innerHTML = "Current Weapon: " + app.player.weapon.weaponName;
    document.getElementById("curWave").innerHTML = "Wave: " + app.wave.number;
    document.getElementById("curPower").innerHTML = "Enemy Power: " + app.power.toFixed(2);
    document.getElementById("curMoney").innerHTML = "Money: " + app.money.curMoney.toFixed(2);
    document.getElementById("curMoneyGainRate").innerHTML = "Money Per Second: " + app.money.highestMoneyGainRate.toFixed(2);


}

function newWeapon() {
    var newPos = 0;
    for (newPos = 0; newPos < app.inventory.slotAreas.length; newPos += 1) {
        if (app.inventory.slotAreas[newPos].slot === null) {
            app.inventory.slotAreas[newPos].slot = new WeaponGroup(app.player, app.power, 0);
            break;
        }
    }
    app.inventory.slotAreas[newPos].addChild(new PIXI.Sprite(app.inventory.slotAreas[newPos].slot.weaponProto.bulletTexture));
    app.inventory.slotAreas[newPos].getChildAt(1).tint = getPlayerColour();
    app.inventory.slotAreas[newPos].getChildAt(1).position.set(32, 32);
    app.money.curMoney = 0;
}

function getWeaponName(entity) {
    var temp = "";
    if (entity.weaponPlaceType != 1) {
        switch (entity.numbarrels) {
            default: temp += "";
            break;
            case 2:
                    temp += "Dual";
                break;
            case 3:
                    temp += "Triple";
                break;
            case 4:
                    temp += "Quad";
                break;
            case 5:
                    temp += "Penta";
                break;
            case 6:
                    temp += "Sexta";
                break;
            case 7:
                    temp += "Septa";
                break;
            case 8:
                    temp += "Octo";
                break;
        }
        switch (entity.weaponPlaceType) {
            default: temp += "";
            break;
            case 2:
                    temp += "Spread";
                break;
            case 3:
                    temp += "Scatter";
                break;
        }
    }
    temp += entity.weaponProto.type.name;
    return temp;
}

function newArmour() {
    app.player.armour = new Armour(app.player, app.money.curMoney);
    app.money.curMoney = 0;
}

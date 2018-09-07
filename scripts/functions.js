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

function swapItems(item1, item2) {
    temp = {};

    if (item1.slot == null) {
        item1.slot = {};

        Object.assign(item1.slot, item2.slot);

        item1.addChild(item2.getChildAt(1));
        item1.getChildAt(1).tint = item2.slot.rarity.colour;
        if (item2.children.length > 1) {
            item2.removeChildAt(1);
        }
        item2.slot = null;
        //item1.getChildAt(1).position.set(32, 32);

        return;
    }

    if (item2.slot == null) {
        return;
    }

    var temp = new PIXI.Container();

    item1.addChild(item2.getChildAt(1));
    item2.addChild(item1.getChildAt(1));

    temp = {};

    Object.assign(temp, item2.slot);
    Object.assign(item2.slot, item1.slot);
    Object.assign(item1.slot, temp);

    item2.getChildAt(1).tint = item2.slot.rarity.colour;
    item1.getChildAt(1).tint = item1.slot.rarity.colour;

    if (item2.pos = 0) {
        Object.assign(app.player.weapon, item2.slot);
    } else if (item2.pos = 1) {
        Object.assign(app.player.armour, item2.slot);
    }

    return;
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
            app.inventory.slotAreas[newPos].slot = new WeaponGroup(app.player, app.money.curMoney, 0);
            break;
        }
    }

    if (newPos >= app.inventory.slotAreas.length) {
        return;
    }
    var weaponImage = new PIXI.Container();
    var size = 3;

    weaponImage.anchor = new PIXI.Point(32, 32);

    for (var i = 0; i < app.inventory.slotAreas[newPos].slot.numbarrels; i += 1) {
        weaponImage.addChild(new PIXI.Sprite(app.inventory.slotAreas[newPos].slot.weaponProto.bulletTexture));

        //console.log(app.inventory.slotAreas[newPos].slot.weapons[i].direction);
        size = app.inventory.slotAreas[newPos].slot.weaponProto.type.size;

        weaponImage.getChildAt(i).position.copy(moveInDirection(new PIXI.Point(32 - (size / 2), 32 - (size / 2)), 4, app.inventory.slotAreas[newPos].slot.weapons[i].direction));
        weaponImage.getChildAt(i).rotation = app.inventory.slotAreas[newPos].slot.weapons[i].direction;
        weaponImage.getChildAt(i).tint = app.inventory.slotAreas[newPos].slot.rarity.colour;
    }



    app.inventory.slotAreas[newPos].addChild(weaponImage);
    app.money.curMoney = 0;
}

function newArmour() {
    var newPos = 0;
    for (newPos = 0; newPos < app.inventory.slotAreas.length; newPos += 1) {
        if (app.inventory.slotAreas[newPos].slot === null) {
            app.inventory.slotAreas[newPos].slot = new Armour(app.player, app.money.curMoney);
            break;
        }
    }

    console.log(app.inventory.slotAreas[1].slot);

    if (newPos >= app.inventory.slotAreas.length) {
        return;
    }
    var armourImage = new PIXI.Container();
    var size = 3;

    armourImage.anchor = new PIXI.Point(32, 32);

    armourImage.addChild(new PIXI.Sprite(app.playerImage));

    armourImage.getChildAt(0).tint = app.inventory.slotAreas[newPos].slot.rarity.colour;

    app.inventory.slotAreas[newPos].addChild(armourImage);

    app.money.curMoney = 0;
}

function getWeaponName(weaponGroup) {
    var temp = "";
    if (weaponGroup.weaponPlaceType != 1) {
        switch (weaponGroup.numbarrels) {
            default: temp += "";
            break;
            case 2:
                    temp += "Dual ";
                break;
            case 3:
                    temp += "Triple ";
                break;
            case 4:
                    temp += "Quad ";
                break;
            case 5:
                    temp += "Penta ";
                break;
            case 6:
                    temp += "Sexta ";
                break;
            case 7:
                    temp += "Septa ";
                break;
            case 8:
                    temp += "Octo ";
                break;
        }
        if (weaponGroup.numbarrels > 1) {
            switch (weaponGroup.weaponPlaceType) {
                default: temp += "";
                break;
                case 2:
                        temp += "Spread ";
                    break;
                case 3:
                        temp += "Scatter ";
                    break;
            }
        }
    }
    temp += weaponGroup.weaponProto.type.name;
    return temp;
}

function genWeaponBox(weapon) {
    var weaponBox = new PIXI.Container;

    var style = {
        fontFamily: "Arial",
        fontSize: 12,
        fill: "black",
        wordWrap: true,
        wordWrapWidth: 200,
    };

    var weaponName = new PIXI.Text(weapon.weaponName, style);
    weaponName.position.set(5, 5);
    weaponBox.addChild(weaponName);

    style.fill = weapon.rarity.colour;
    var weaponRarity = new PIXI.Text(weapon.rarity.name, style);
    weaponRarity.position.set(5, weaponBox.height + 5);
    weaponBox.addChild(weaponRarity);

    style.fill = "black";

    var weaponDamage = new PIXI.Text(weapon.weaponProto.damage.toFixed(2) + " damage", style);

    if ((weapon.numbarrels > 1) && (weapon.weaponPlaceType != 1)) {
        weaponDamage.text = weapon.weaponProto.damage.toFixed(2) + " damage x" + weapon.numbarrels;
    }

    weaponDamage.position.set(5, weaponBox.height + 5);

    weaponBox.addChild(weaponDamage);

    var background = genBoxSprite(weaponBox.width + 5, weaponBox.height + 5, 2, 0x000000, 0xFFFFFF);

    weaponBox.addChild(background);

    weaponBox.swapChildren(weaponName, background)

    return weaponBox;
}

function genArmourBox(armour) {
    var armourBox = new PIXI.Container;

    var style = {
        fontFamily: "Arial",
        fontSize: 12,
        fill: "black",
        wordWrap: true,
        wordWrapWidth: 200,
    };

    var armourName = new PIXI.Text("Armour", style);
    armourName.position.set(5, 5);
    armourBox.addChild(armourName);

    style.fill = armour.rarity.colour;
    var armourRarity = new PIXI.Text(armour.rarity.name, style);
    armourRarity.position.set(5, armourBox.height + 5);
    armourBox.addChild(armourRarity);

    style.fill = "black";

    var armourHP = new PIXI.Text(armour.maxHP.toFixed(2) + " HP", style);

    armourHP.position.set(5, armourBox.height + 5);

    armourBox.addChild(armourHP);

    var background = genBoxSprite(armourBox.width + 5, armourBox.height + 5, 2, 0x000000, 0xFFFFFF);

    armourBox.addChild(background);

    armourBox.swapChildren(armourName, background)

    return armourBox;
}

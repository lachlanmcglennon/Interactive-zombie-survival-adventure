//This file contains general purpose functions used throughout the code.

function getAngleInRadians(p1, p2) {
    //Gets the angle between 2 PIXI.Point values, and returns it, in radians.
    var theta = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    if (theta < 0) {
        theta = toRadians(360) + theta
    }
    return theta;
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

function angleIsLeft(a1, a2) {
    //Takes 2 angles and determines if angle 2 is to the left of angle one.

    if (a1 < toRadians(180)) {
        return !((a2 < a1 + toRadians(180)) && (a2 > a1));
    } else {
        return ((a2 < a1) && (a2 > (a1 - toRadians(180))));
    }
}

function offsetPoint(point, width, height) {
    //Takes a point and offsets it to be in the middle of a given width/height.

    return new PIXI.Point(point.x + width / 2, point.y + height / 2);
}

function circularCollision(eSize1, eSize2, ePos1, ePos2) {
    if (getDistanceFrom(ePos1, ePos2) < eSize1 + eSize2) {
        return true;
    } else {
        return false;
    }
}

function intercept(src, dst, v) {
  var tx = dst.x - src.x,
      ty = dst.y - src.y,
      tvx = dst.vx,
      tvy = dst.vy;

  // Get quadratic equation components
  var a = tvx*tvx + tvy*tvy - v*v;
  var b = 2 * (tvx * tx + tvy * ty);
  var c = tx*tx + ty*ty;    

  // Solve quadratic
  var ts = quad(a, b, c); // See quad(), below

  // Find smallest positive solution
  var sol = null;
  if (ts) {
    var t0 = ts[0], t1 = ts[1];
    var t = Math.min(t0, t1);
    if (t < 0) t = Math.max(t0, t1);    
    if (t > 0) {
      sol = {
        x: dst.x + dst.vx*t,
        y: dst.y + dst.vy*t
      };
    }
  }
  return sol;
}


/**
 * Return solutions for quadratic
 */
function quad(a,b,c) {
  var sol = null;
  if (Math.abs(a) < 1e-6) {
    if (Math.abs(b) < 1e-6) {
      sol = Math.abs(c) < 1e-6 ? [0,0] : null;
    } else {
      sol = [-c/b, -c/b];
    }
  } else {
    var disc = b*b - 4*a*c;
    if (disc >= 0) {
      disc = Math.sqrt(disc);
      a = 2*a;
      sol = [(-b-disc)/a, (-b+disc)/a];
    }
  }
  return sol;
}

function getMaxReload(maxUse, team) {
    if ((maxUse - app.upgrades.slots[3].power <= 3) && (team === 0)) {
        return 3;
    } else if (team === 0) {
        return maxUse - app.upgrades.slots[3].power;
    } else {
        return maxUse
    }
}

function getBonusFromReload(maxUse, team) {
    if ((maxUse - app.upgrades.slots[3].power <= 3) && (team === 0)) {
        return app.upgrades.slots[3].power / maxUse;
    } else {
        return 1;
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
    if ((storageAvailable('localStorage')) && (localStorage.getItem("PlayerCol"))) {
        var colour = localStorage.getItem("PlayerCol");
    } else {
        var colour = document.getElementById("playerCol").value;
    }
    if (storageAvailable('localStorage')) {
        localStorage.setItem("PlayerCol", document.getElementById("playerCol").value);
    }
    return colour.replace("#", "0x");
}

function setPlayerColour() {
    console.log(getPlayerColour());
    app.player.changeColour(getPlayerColour());
}

function getEntity(id) {
    for (var i = 0; i < app.players.children.length; i += 1) {
        if (app.players.children[i].id === id) {
            return app.players.children[i];
        }
    }
    return null;
}

function logBase(n, base) {
    return Math.log(n) / (base ? Math.log(base) : 1);
}

function decimalToHexString(number) {
    if (number < 0) {
        number = 0xFFFFFFFF + number + 1;
    }

    return number.toString(16).toUpperCase();
}

function genRandomColour() {
    return "0x" + decimalToHexString(Math.floor(255 * 0)) +
        decimalToHexString(Math.floor(255 * 0)) +
        decimalToHexString(Math.floor(255 * 0));
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

    if (item2.slot.className === "Weapon") {
        Object.assign(app.player.weapon, item2.slot);
    } else {
        Object.assign(app.player.armour, item2.slot);
    }

    return;
}

function updateUI() {
    document.getElementById("curWave").innerHTML = "Wave: " + app.wave.number;
    document.getElementById("curPower").innerHTML = "Enemy Power: " + formatNumber(app.wave.enemyFactor);
    if (app.unlocks.inventoryUnlocked) {
        document.getElementById("curMoney").innerHTML = "Money: " + formatNumber(app.money.curMoney);
        document.getElementById("curMoneyGainRate").innerHTML = "Money Per Second: " + formatNumber(app.money.highestMoneyGainRate) + " x " + formatNumber(app.money.moneyGainBonus);
    } else {
        document.getElementById("curMoney").innerHTML = "???";
        document.getElementById("curMoneyGainRate").innerHTML = "???";
    }

    document.getElementById("curPlayerHP").innerHTML = "Player HP: " + formatNumber(app.player.armour.curHP);
    document.getElementById("curArenaName").innerHTML = "Arena: " + app.unlocks.arenaName;
    document.getElementById("fps").innerHTML = "FPS: " + app.ticker.FPS;

}

function newWeapon(type) {
    var newPos = 0;
    for (newPos = 0; newPos < app.inventory.slotAreas.length; newPos += 1) {
        if (app.inventory.slotAreas[newPos].slot === null) {
            app.inventory.slotAreas[newPos].slot = new WeaponGroup(app.player.id, app.money.curMoney.mul(0.5), 0, type);
            break;
        }
    }
    
    app.money.curMoney = app.money.curMoney.mul(0.5);

    if (newPos >= app.inventory.slotAreas.length) {
        return;
    }
    var weaponImage = new PIXI.Container();
    var size = 3;

    weaponImage.anchor = new PIXI.Point(32, 32);

    for (var i = 0; i < app.inventory.slotAreas[newPos].slot.numbarrels; i += 1) {
        weaponImage.addChild(new PIXI.Sprite(app.bulletImages[app.inventory.slotAreas[newPos].slot.weapons[0].type.image]));

        //console.log(app.inventory.slotAreas[newPos].slot.weapons[i].direction);
        size = app.inventory.slotAreas[newPos].slot.weaponProto.type.size;

        weaponImage.getChildAt(i).position.copy(moveInDirection(new PIXI.Point(32 - (size / 2), 32 - (size / 2)), 4, app.inventory.slotAreas[newPos].slot.weapons[i].direction));
        weaponImage.getChildAt(i).rotation = app.inventory.slotAreas[newPos].slot.weapons[i].direction;
        weaponImage.getChildAt(i).tint = app.inventory.slotAreas[newPos].slot.rarity.colour;
    }

    var style = {
        fontFamily: "Arial",
        fontSize: 8,
        fill: "red"
    };
    
    for (var i = 0; i < app.inventory.slotAreas[newPos].slot.effects.length; i += 1) {
        if (app.inventory.slotAreas[newPos].slot.effects[i] === "Critical") {
            style.fill = "orange";                     
        }
    }

    var stats = new PIXI.Text(formatNumber(app.inventory.slotAreas[newPos].slot.weaponProto.damage.mul(app.upgrades.slots[1].power).mul(app.inventory.slotAreas[newPos].slot.rarity.statMod)), style);

    if (app.inventory.slotAreas[newPos].slot.numbarrels > 1) {
        stats.text += " x " + app.inventory.slotAreas[newPos].slot.numbarrels;
    }
    
    

    stats.position.set(5, 48);

    weaponImage.addChild(stats);

    app.inventory.slotAreas[newPos].addChild(weaponImage);
}

function storeWeapon(weapon) {
    var storedWeapon = {
        className: "Weapon",
        power: weapon.power,
        effects: weapon.effects,
        rarity: weapon.rarity.id,
        numBarrels: weapon.numbarrels,
        weaponType: weapon.weaponType,
        placeType: weapon.weaponPlaceType
    }
    return storedWeapon;
}

function loadWeapon(storedWeapon, slot) {
    if (storedWeapon === null) {
        return;
    }
    if (newPos >= app.inventory.slotAreas.length) {
        return;
    }

    var newPos = slot;
    app.inventory.slotAreas[newPos].slot = new LoadedWeaponGroup(storedWeapon);

    var weaponImage = new PIXI.Container();
    var size = 3;

    weaponImage.anchor = new PIXI.Point(32, 32);

    for (var i = 0; i < app.inventory.slotAreas[newPos].slot.numbarrels; i += 1) {
        weaponImage.addChild(new PIXI.Sprite(app.bulletImages[app.inventory.slotAreas[newPos].slot.weapons[0].type.image]));

        //console.log(app.inventory.slotAreas[newPos].slot.weapons[i].direction);
        size = app.inventory.slotAreas[newPos].slot.weaponProto.type.size;

        weaponImage.getChildAt(i).position.copy(moveInDirection(new PIXI.Point(32 - (size / 2), 32 - (size / 2)), 4, app.inventory.slotAreas[newPos].slot.weapons[i].direction));
        weaponImage.getChildAt(i).rotation = app.inventory.slotAreas[newPos].slot.weapons[i].direction;
        weaponImage.getChildAt(i).tint = app.inventory.slotAreas[newPos].slot.rarity.colour;
    }

    var style = {
        fontFamily: "Arial",
        fontSize: 8,
        fill: "red"
    };
    
    for (var i = 0; i < app.inventory.slotAreas[newPos].slot.effects.length; i += 1) {
        if (app.inventory.slotAreas[newPos].slot.effects[i] === "Critical") {
            style.fill = "orange";                     
        }
    }

    var stats = new PIXI.Text(formatNumber(app.inventory.slotAreas[newPos].slot.weaponProto.damage.mul(app.upgrades.slots[1].power).mul(app.inventory.slotAreas[newPos].slot.rarity.statMod)), style);

    if (app.inventory.slotAreas[newPos].slot.numbarrels > 1) {
        stats.text += " x " + app.inventory.slotAreas[newPos].slot.numbarrels;
    }

    stats.position.set(5, 48);

    weaponImage.addChild(stats);

    app.inventory.slotAreas[newPos].addChild(weaponImage);
}

function newArmour() {
    var newPos = 0;
    for (newPos = 0; newPos < app.inventory.slotAreas.length; newPos += 1) {
        if (app.inventory.slotAreas[newPos].slot === null) {
            app.inventory.slotAreas[newPos].slot = new Armour(app.money.curMoney.mul(5), 0);
            break;
        }
    }

    app.money.curMoney = app.money.curMoney.mul(0.5);

    if (newPos >= app.inventory.slotAreas.length) {
        return;
    }
    var armourImage = new PIXI.Container();
    var size = 3;

    armourImage.anchor = new PIXI.Point(32, 32);

    armourImage.addChild(new PIXI.Sprite(app.playerImage));

    armourImage.getChildAt(0).tint = app.inventory.slotAreas[newPos].slot.rarity.colour;

    var style = {
        fontFamily: "Arial",
        fontSize: 8,
        fill: "red"
    };

    var stats = new PIXI.Text(formatNumber(app.inventory.slotAreas[newPos].slot.getMaxHP(app.upgrades.slots[2].power)), style);

    stats.position.set(5, 48);

    armourImage.addChild(stats);

    app.inventory.slotAreas[newPos].addChild(armourImage);

    app.money.curMoney = app.money.curMoney.mul(0.5);
}

function storeArmour(armour) {
    var storedArmour = {
        className: "Armour",
        power: armour.power,
        rarity: armour.rarity.id
    }
    return storedArmour;
}

function loadArmour(armour, slot) {
    if (armour === null) {
        return;
    }

    if (newPos >= app.inventory.slotAreas.length) {
        return;
    }

    var newPos = slot;
    app.inventory.slotAreas[newPos].slot = new LoadArmour(armour);

    //console.log(app.inventory.slotAreas[43].slot);

    var armourImage = new PIXI.Container();
    var size = 3;

    armourImage.anchor = new PIXI.Point(32, 32);

    armourImage.addChild(new PIXI.Sprite(app.playerImage));

    armourImage.getChildAt(0).tint = app.inventory.slotAreas[newPos].slot.rarity.colour;

    var style = {
        fontFamily: "Arial",
        fontSize: 8,
        fill: "red"
    };

    var stats = new PIXI.Text(formatNumber(app.inventory.slotAreas[newPos].slot.getMaxHP(app.upgrades.slots[2].power)), style);

    stats.position.set(5, 48);

    armourImage.addChild(stats);

    app.inventory.slotAreas[newPos].addChild(armourImage);
}

function storeUpgrade(UpgradeArea) {
    var storedUpgrade = {
        text: UpgradeArea.upgradeText,
        x: UpgradeArea.x,
        y: UpgradeArea.y,
        startingPrice: UpgradeArea.price,
        costScaling: UpgradeArea.priceMult,
        startingPower: UpgradeArea.power,
        powerScaling: UpgradeArea.powerMult,
        startingLevel: UpgradeArea.level
    }
    return storedUpgrade;
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

    var weaponDamage = new PIXI.Text(formatNumber(weapon.power.mul(app.upgrades.slots[1].power).mul(weapon.rarity.statMod)) + " damage", style);

    if ((weapon.numbarrels > 1) && (weapon.weaponPlaceType != 1)) {
        weaponDamage.text = formatNumber(weapon.power.mul(app.upgrades.slots[1].power)) + " damage x" + weapon.numbarrels;
    }

    weaponDamage.position.set(5, weaponBox.height + 5);

    weaponBox.addChild(weaponDamage);

    var effectName = [];

    var critText = {},
        pierceText = {};

    for (var i = 0; i < weapon.effects.length; i += 1) {
        effectName[i] = new PIXI.Text(weapon.effects[i], style);
        effectName[i].position.set(5, weaponBox.height + 5);
        weaponBox.addChild(effectName[i]);

        if (weapon.effects[i] === "Critical") {
            var rate = weapon.power.exponent * 5;
            if (rate > 100) {
                rate = 100
            }
            critText = new PIXI.Text(rate + "% chance to do x" +
                formatNumber(new Decimal(new Decimal(1.03).pow(weapon.power.log2()))) + " more damage.", style);
            critText.position.set(5, weaponBox.height + 5);
            weaponBox.addChild(critText);

        }

        if (weapon.effects[i] === "Pierce") {
            pierceText = new PIXI.Text("Bullets pierce " +
                weapon.power.exponent + " enemies.", style);
            pierceText.position.set(5, weaponBox.height + 5);
            weaponBox.addChild(pierceText);
        }
    }
    var background = genBoxSprite(weaponBox.width + 5, weaponBox.height + 5, 2, 0x000000, 0xFFFFFF);

    weaponBox.addChild(background);

    weaponBox.swapChildren(weaponName, background)
    return weaponBox;
}

function genArmourBox(armour) {
    var armourBox = new PIXI.Container();

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

    var armourHP = new PIXI.Text(formatNumber(armour.getMaxHP(app.upgrades.slots[2].power)) + " HP", style);

    armourHP.position.set(5, armourBox.height + 5);

    armourBox.addChild(armourHP);

    var background = genBoxSprite(armourBox.width + 5, armourBox.height + 5, 2, 0x000000, 0xFFFFFF);

    armourBox.addChild(background);

    armourBox.swapChildren(armourName, background)

    return armourBox;
}

function formatNumber(num) {
    //console.log(num);
    var str = "";
    var temp = "";
    if (app.settings.format == "norm") {
        if (num.exponent > 3002) {
            str = num.mantissaWithDecimalPlaces(2) + "e" + num.exponent;
        } else if (num.exponent > 32) {
            var ones = ["", "U", "D", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No"],
                tens = ["", "Dc", "Vi", "Tg", "Qag", "Qig", "Sxg", "Spg", "Og", "Ng"],
                hundreds = ["", "C", "DC", "TC", "QaC", "QiC", "SxC", "Spc", "OcC", "NcC"]
            str = (Math.pow(10, num.exponent % 3) * num.mantissa).toFixed(2) + "";
            var exp = num.exponent - 3;
            str += hundreds[Math.floor(exp / 300)] +
                ones[Math.floor(exp / 3) % ones.length] +
                tens[Math.floor(exp / 30) % tens.length];
        } else if (num.exponent > 2) {
            str = (Math.pow(10, num.exponent % 3) * num.mantissa).toFixed(2);
            var startNotations = ['K', 'M', 'B', 'T', 'Qt', 'Qi', 'Sx', 'Sp', 'O', 'N'];
            str += startNotations[Math.floor(num.exponent / 3) - 1];
        } else {
            str = num.toNumber().toFixed(2);
        }
    } else if (app.settings.format == "sci") {
        if (num.exponent > 2) {
            str = num.mantissaWithDecimalPlaces(2) + "e" + num.exponent;
        } else {
            str = num.toNumber().toFixed(2);
        }
    } else if (app.settings.format == "eng") {
        if (num.exponent > 2) {
            str = (num.mantissaWithDecimalPlaces(2 + (num.exponent % 3)) * Math.pow(10, (num.exponent % 3))).toFixed(2) + "e" + (num.exponent - (num.exponent % 3));
        } else {
            str = num.toNumber().toFixed(2);
        }
    }
    return str;
}

function storageAvailable(type) {
    try {
        var storage = window[type],
            x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    } catch (e) {
        return e instanceof DOMException && (
                // everything except Firefox
                e.code === 22 ||
                // Firefox
                e.code === 1014 ||
                // test name field too, because code might not be present
                // everything except Firefox
                e.name === 'QuotaExceededError' ||
                // Firefox
                e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            storage.length !== 0;
    }
}

function getEnPow(wave) {
    var base = new Decimal(app.wave.factorStartPow),
        cur = new Decimal(1),
        curWave = wave;
    while (curWave >= 100) {
        cur = cur.mul(base.add(Math.floor(curWave / 1000) * app.wave.factorIncrease).pow(100));
        curWave -= 100;
    }
    cur = cur.add(base.pow(curWave));
    return cur;
}

function checkUnlocks(wave) {
    var arenaNames = ["Unranked ", "Bronze ", "Silver ", "Gold ", "Diamond ", "Antimatter "];

    if (wave.lt(12)) {
        app.unlocks.arenaName = arenaNames[0];
    } else if (wave.lt(500)) {
        app.unlocks.arenaName = arenaNames[Math.floor(app.wave.number.toNumber() / 100) + 1] + Math.floor(((app.wave.number.toNumber() % 100) - (app.wave.number.toNumber() % 10)) / 10);
    } else if (wave.lt(1000)) {
        app.unlocks.arenaName = "Elite rank " + Math.ceil(100 - ((wave.toNumber() - 500) / 5));
    } else {
        app.unlocks.arenaName = "Champion "
    }

    app.unlocks.arenaName += "(Next unlock at wave " + app.unlocks.nextUnlock + ")";

    if ((app.unlocks.inventoryUnlocked === false) && (wave.gte(8))) {
        app.unlocks.inventoryUnlocked = true;
        app.inventory.inventoryArea.visible = true;
        app.inventory.clickTab.interactive = true;
        new Notification("You unlocked the inventory screen \n Press n/m or press the buttons to make a new weapon/armour using 50% of your collected money\n and press x to sell them.");
        app.unlocks.nextUnlock = 25;
    }
    if ((app.unlocks.maxRarity <= 0) && (wave.gte(25))) {
        app.unlocks.maxRarity = 1;
        new Notification("You can now craft Specialized rarity items.\n These items will have special effects such as:\n Homing will cause your bullets to move to chase down enemies automatically.\n Crit gives a % chance to do extra damage with a hit\n Pierce allows your bullet to hit multiple enemies.");
        app.unlocks.nextUnlock = 50;
    }
    if ((app.unlocks.maxRarity <= 1) && (wave.gte(50))) {
        app.unlocks.maxRarity = 2;
        new Notification("You can now craft Elite rarity items \n These are rare but will have 2 special effects.");
        app.unlocks.nextUnlock = 75;
    }
    if ((app.unlocks.upgradesUnlocked === false) && (wave.gte(75))) {
        app.unlocks.upgradesUnlocked = true;
        app.upgrades.upgradesArea.visible = true;
        app.upgrades.clickTab.interactive = true;
        new Notification("You unlocked the upgrades screen \n Click the button under each upgrade to buy them.");
        app.unlocks.nextUnlock = 100;
    }
    if ((app.unlocks.upgrades <= 0) && (wave.gte(100))) {
        app.unlocks.upgrades = 1;
        app.upgrades.slots[1].visible = true;
        app.upgrades.slots[1].button.interactive = true;
        new Notification("You unlocked Damage upgrades in the upgrades screen");
        app.unlocks.nextUnlock = 125;
    }
    if ((app.unlocks.upgrades <= 1) && (wave.gte(125))) {
        app.unlocks.upgrades = 2;
        app.upgrades.slots[2].visible = true;
        app.upgrades.slots[2].button.interactive = true;
        new Notification("You unlocked Health upgrades in the upgrades screen");
        app.unlocks.nextUnlock = 200;
    }
    if ((wave.gte(150)) && (app.unlocks.autoUnlocked === false)) {
        app.unlocks.autoUnlocked = true;
        new Notification("You can now use the autoplay feature by pressing L.");
        app.unlocks.nextUnlock = 200;
    }

    if ((app.unlocks.maxRarity <= 2) && (wave.gte(200))) {
        app.unlocks.maxRarity = 3;
        new Notification("You can now craft Perfect rarity items \n These ultra rare items have all effects at once.");
        app.unlocks.nextUnlock = 225;
    }

    if ((app.unlocks.upgrades <= 2) && (wave.gte(225))) {
        app.unlocks.upgrades = 3;
        app.upgrades.slots[3].visible = true;
        app.upgrades.slots[3].button.interactive = true;
        new Notification("You unlocked Rate of fire upgrades in the upgrades screen");
        app.unlocks.nextUnlock = "???";
    }

    if (wave.gte(500)) {
        app.unlocks.nextUnlock = "???";
    }

    if (wave.gte(1000)) {
        app.unlocks.nextUnlock = "???";
    }
}

function doSpawnBoss() {
    if (app.players.children.length > 2) {
        return 2;
    }

    app.wave.bossSpawned = true;
    var temp = moveInDirection(app.player.position, 1000 * Math.random() + 300, toRadians(360 * Math.random()));

        while (collidingWithWall(temp)) {
            var temp = moveInDirection(app.player.position, 1000 * Math.random() + 300, toRadians(360 * Math.random()));
        }
        var xToSpawn = temp.x,
            yToSpawn = temp.y;
    new Entity(new PIXI.Texture(app.playerImage), genRandomColour(),
            app.wave.enemyFactor.mul(50), 2.5, 10, 1, xToSpawn, yToSpawn);
    var spawnedBoss = app.players.children[app.players.children.length - 1];
    spawnedBoss.scale.set(2, 2);
    if (app.weaponTypes[spawnedBoss.weapon.weaponType].speed <= (4 * 1.3)) {
        spawnedBoss.weapon.effects.push(effectTypes[0]);
    }
    return 1;
}

function spawnBoss() {
    if ((app.unlocks.nextUnlock === "???") && (app.wave.bossSpawned === false)) {
        if ((app.wave.number.toNumber() + 2) % 50 === 0) {
            return doSpawnBoss();
        } else {
            return 0;
        }
    }
    
    if (app.wave.number.eq(app.unlocks.nextUnlock - 2) && app.wave.bossSpawned === false) {
        return doSpawnBoss();
    }
    
    if (app.wave.bossSpawned === true && app.wave.enemiesOnScreen === 0) {
        //Boss was present but is dead, start next wave.
        app.wave.bossSpawned = false;
        return 0;
    }
    
    if (app.wave.bossSpawned === false) {
        return 0;
    }
    
    //Boss is still being fought
    return 2;
}

function toggleIdle() {
    app.keys.mouseLocked = !app.keys.mouseLocked;
    app.keys.autofire = true;
}

function updateInventoryText() {
    for (var i = 0; i < app.inventory.slotAreas.length; i += 1) {
        if (app.inventory.slotAreas[i].slot != null) {
            if (app.inventory.slotAreas[i].slot.className === "Weapon") {
                app.inventory.slotAreas[i].children[1].children[app.inventory.slotAreas[i].children[1].children.length - 1].text = formatNumber(app.inventory.slotAreas[i].slot.power.mul(app.upgrades.slots[1].power).mul(app.inventory.slotAreas[i].slot.rarity.statMod));

                if (app.inventory.slotAreas[i].slot.numbarrels > 1) {
                    app.inventory.slotAreas[i].children[1].children[app.inventory.slotAreas[i].children[1].children.length - 1].text += " x " + app.inventory.slotAreas[i].slot.numbarrels;
                }
            } else {
                app.inventory.slotAreas[i].children[1].children[app.inventory.slotAreas[i].children[1].children.length - 1].text = formatNumber(app.inventory.slotAreas[i].slot.getMaxHP(app.upgrades.slots[2].power));
            }
        }
    }
}

//This file constains prototype definitions for all new objects in the game.

//Keys currently being pressed.
function Keys() {
    this.a = false;
    this.d = false;
    this.s = false;
    this.w = false;

    this.left = false;
    this.right = false;
    this.down = false;
    this.up = false;

    this.mouseLeft = false;
    this.mouseLocked = false;
    this.autofire = false;
    this.pause = false;
    this.hideBullets = true;
    this.sell = false;
    this.deathPaused = false;
}

function Mouse() {
    this.position = new PIXI.Point(0, 0);
    this.displayBox = new PIXI.Container();
    this.showBox = false;

    this.curSlot = null;

    app.stage.addChild(this.displayBox);

    this.moveBox = function () {
        if (this.showBox === true) {
            if (this.displayBox === null) {
                this.displayBox.visible = false;
            } else {
                this.displayBox.visible = true;
                this.displayBox.position.set(this.position.x - this.displayBox.width + app.transform.x, this.position.y + app.transform.y);
            }
        } else {
            this.displayBox.visible = false;
        }
    }

    app.ticker.add(this.moveBox, this);
}

function Moveable(speed) {
    this.speed = speed;
    this.accel = new PIXI.Point(0, 0);
    this.update = function () {
        if (app.keys.pause === true) {
            return;
        }
        this.position.x += this.accel.x;
        this.position.y += this.accel.y;
    };

    app.ticker.add(this.update, this);
}

function Entity(texture, colour, power, speed, size, team, x, y) {
    //An entity is any kind of controlled character on stage, player or enemy.
    PIXI.Container.call(this);

    this.image = new PIXI.Sprite(texture);
    //this.image.transform.scale = size;

    this.id = app.id;
    app.id += 1;

    this.autoDirection = 0;
    
    this.addChild(this.image);

    this.colour = colour;

    this.image.tint = this.colour;

    this.changeColour = function (colour) {
        this.image.tint = this.colour;
    }

    this.healthBarArea = new PIXI.Container();

    this.healthBarArea.addChild(genBoxSprite(50, 10, 2, 0x000000, 0x222222));
    this.healthBarArea.addChild(genBoxSprite(46, 6, 1, 0x000000, 0xFFFFFF));

    this.healthBarArea.getChildAt(1).position.set(2, 2);

    this.healthBarArea.position.set(this.position.x - 25, this.position.y - 40);

    this.addChild(this.healthBarArea);

    //Power of this entity based on the current wave.
    this.power = power;

    this.team = team;

    this.weapon = new WeaponGroup(this.id, power, team, -1);

    //this.interactive = true;
    this.hitArea = new PIXI.Circle(0, 0, 10);

    this.position.set(x, y);

    this.image.anchor.set(0.5, 0.5);

    Moveable.call(this, speed);

    this.size = size;

    this.moveTarget = new PIXI.Point();
    this.weaponTarget = new PIXI.Point();

    this.armour = new Armour(power, this.team);

    if (this.team == 0) {
        PlayerAI.call(this);
    } else {
        this.weapon.weaponProto.type.ai.call(this);
    }

    this.delete = function () {
        app.players.removeChild(this);
        app.ticker.remove(this.tick, this);
        app.ticker.remove(this.update, this);
        app.ticker.remove(this.updateHealthBar, this);
        app.ticker.remove(this.testWallCollision, this);
        this.weapon.delete();
        this.armour.delete();
        this.destroy();
    };

    app.players.addChild(this);

    this.updateHealthBar = function () {
        if (this.armour.curHP.gt(0)) {
            this.healthBarArea.getChildAt(1).width = 46 * (this.armour.curHP.div(this.armour.getMaxHP(app.upgrades.slots[2].power))).toNumber();
        }

        if ((this.armour.curHP.div(this.armour.getMaxHP(app.upgrades.slots[2].power))).toNumber() > 0.5) {
            this.healthBarArea.getChildAt(1).tint = 0x00FF00;
        } else if ((this.armour.curHP.div(this.armour.getMaxHP(app.upgrades.slots[2].power))).toNumber() > 0.2) {
            this.healthBarArea.getChildAt(1).tint = 0xFFFF00;
        } else {
            this.healthBarArea.getChildAt(1).tint = 0xFF0000;
        }
    }

    this.testWallCollision = function () {

        if (this.position.x > app.wall.position.x + app.wall.width) {
            this.position.x = app.wall.position.x + app.wall.width;
        }

        if (this.position.x < app.wall.position.x) {
            this.position.x = app.wall.position.x;
        }

        if (this.position.y > app.wall.position.y + app.wall.height) {
            this.position.y = app.wall.position.y + app.wall.height;
        }

        if (this.position.y < app.wall.position.y) {
            this.position.y = app.wall.position.y;
        }
    }
    app.ticker.add(this.updateHealthBar, this);
    app.ticker.add(this.testWallCollision, this);
}

function WeaponGroup(id, power, team, type) {
    //0 for player, 1 for enemy.
    this.team = team;
    this.weapons = [];

    this.className = "Weapon";

    this.entityID = id;

    this.effects = [];

    this.power = power;

    var maxDeviation = toRadians(90);
    if (this.team === 0) {
        this.numbarrels = Math.ceil(Math.random() * 8) + 0;
    } else {
        this.numbarrels = Math.ceil(Math.random() * 3) + 0;
    }
    if (type === -1) {
        this.weaponType = Math.floor(Math.random() * app.weaponTypes.length);
        this.weaponPlaceType = Math.ceil(Math.random() * 3);
    } else {
        this.weaponType = type;
        this.weaponPlaceType = 0;
    }
    //this.weaponPlaceType = 2;

    var raritySeed = Math.random();
    this.rarity = 0;

    if (raritySeed > 0.99) {
        this.rarity = 3;
    } else if (raritySeed > 0.9) {
        this.rarity = 2;
    } else if (raritySeed > 0.6) {
        this.rarity = 1;
    } else {
        this.rarity = 0;
    }

    if (this.rarity > app.unlocks.maxRarity) {
        this.rarity = app.rarities[app.unlocks.maxRarity];
    } else {
        this.rarity = app.rarities[this.rarity];
    }

    if (this.team === 0) {
        this.maxNumEffects = this.rarity.effectSlots;

        raritySeed = Math.random();

        for (var i = 0; i < effectTypes.length; i += 1) {
            this.effects.push(effectTypes[i]);
        }


        while (this.effects.length > this.maxNumEffects) {
            this.effects.splice(Math.floor(raritySeed * this.effects.length), 1);
            raritySeed = Math.random();
        }
    }

    this.delete = function () {
        for (var i = 0; i < this.weapons.length; i += 1) {
            app.ticker.remove(this.weapons[i].reload, this.weapons[i]);
        }
    }
    
    this.updatePow = function (newPow) {
        for (var i = 0; i < this.weapons.length; i += 1) {
            this.weapons[i].setPow(newPow);
        }
    }


    this.weaponProto = new Weapon(this.entityID, new Decimal(this.power).div(this.numbarrels), this.rarity, this.weaponType);
    this.weapons[0] = Object.create(this.weaponProto);

    switch (this.weaponPlaceType) {
        default: this.numbarrels = 1;
        app.ticker.add(this.weapons[0].reload, this.weapons[0]);
        break;
        case 2:
                var angleBetween = toRadians(10);

            if (this.numbarrels % 2 == 0) {
                var n = 1;

                for (var i = 0; i < this.numbarrels; i += 2) {
                    n = 1 + Math.floor(i / 2);

                    this.weapons[i] = Object.create(this.weaponProto);
                    this.weapons[i].setDirection((n * angleBetween + toRadians(-5)));
                    app.ticker.add(this.weapons[i].reload, this.weapons[i]);

                    this.weapons[i + 1] = Object.create(this.weaponProto);
                    this.weapons[i + 1].setDirection((n * angleBetween + toRadians(-5)) * -1);
                    app.ticker.add(this.weapons[i + 1].reload, this.weapons[i + 1]);
                }
            } else {
                this.weapons[0] = Object.create(this.weaponProto);
                this.weapons[0].setDirection(0);
                app.ticker.add(this.weapons[0].reload, this.weapons[0]);
                var n = 1;

                for (var i = 1; i < this.numbarrels; i += 2) {
                    n = 1 + Math.floor(i / 2);

                    this.weapons[i] = Object.create(this.weaponProto);
                    this.weapons[i].setDirection((n * angleBetween + toRadians(-5)));
                    app.ticker.add(this.weapons[i].reload, this.weapons[i]);

                    this.weapons[i + 1] = Object.create(this.weaponProto);
                    this.weapons[i + 1].setDirection((n * angleBetween + toRadians(-5)) * -1);
                    app.ticker.add(this.weapons[i + 1].reload, this.weapons[i + 1]);
                }
            }

            break;
        case 3:
                var angleBetween = toRadians(360) / this.numbarrels;
            for (var i = 0; i < this.numbarrels; i += 1) {
                this.weapons[i] = Object.create(this.weaponProto);
                this.weapons[i].setDirection(i * angleBetween);
                app.ticker.add(this.weapons[i].reload, this.weapons[i]);
            }
            break;
    }
    this.weaponName = getWeaponName(this);
}

function LoadedWeaponGroup(storedWeapon) {
    //0 for player, 1 for enemy.
    this.team = 0;
    this.weapons = [];

    this.className = "Weapon";

    this.entityID = 0;

    this.effects = storedWeapon.effects;

    this.power = new Decimal(storedWeapon.power);

    var maxDeviation = toRadians(90);
    this.numbarrels = storedWeapon.numBarrels;
    this.weaponType = storedWeapon.weaponType;
    this.weaponPlaceType = storedWeapon.placeType;
    //this.weaponPlaceType = 2;

    this.rarity = app.rarities[storedWeapon.rarity];

    this.delete = function () {
        for (var i = 0; i < this.weapons.length; i += 1) {
            app.ticker.remove(this.weapons[i].reload, this.weapons[i]);
        }
    }
    
    this.updatePow = function (newPow) {
        for (var i = 0; i < this.weapons.length; i += 1) {
            this.weapons[i].setPow(newPow);
        }
    }

    this.weaponProto = new Weapon(this.entityID, new Decimal(this.power).div(this.numbarrels), this.rarity, this.weaponType);
    this.weapons[0] = Object.create(this.weaponProto);

    switch (this.weaponPlaceType) {
        default: this.numbarrels = 1;
        app.ticker.add(this.weapons[0].reload, this.weapons[0]);
        break;
        case 2:
                var angleBetween = toRadians(10);

            if (this.numbarrels % 2 == 0) {
                var n = 1;

                for (var i = 0; i < this.numbarrels; i += 2) {
                    n = 1 + Math.floor(i / 2);

                    this.weapons[i] = Object.create(this.weaponProto);
                    this.weapons[i].setDirection((n * angleBetween + toRadians(-5)));
                    app.ticker.add(this.weapons[i].reload, this.weapons[i]);

                    this.weapons[i + 1] = Object.create(this.weaponProto);
                    this.weapons[i + 1].setDirection((n * angleBetween + toRadians(-5)) * -1);
                    app.ticker.add(this.weapons[i + 1].reload, this.weapons[i + 1]);
                }
            } else {
                this.weapons[0] = Object.create(this.weaponProto);
                this.weapons[0].setDirection(0);
                app.ticker.add(this.weapons[0].reload, this.weapons[0]);
                var n = 1;

                for (var i = 1; i < this.numbarrels; i += 2) {
                    n = 1 + Math.floor(i / 2);

                    this.weapons[i] = Object.create(this.weaponProto);
                    this.weapons[i].setDirection((n * angleBetween + toRadians(-5)));
                    app.ticker.add(this.weapons[i].reload, this.weapons[i]);

                    this.weapons[i + 1] = Object.create(this.weaponProto);
                    this.weapons[i + 1].setDirection((n * angleBetween + toRadians(-5)) * -1);
                    app.ticker.add(this.weapons[i + 1].reload, this.weapons[i + 1]);
                }
            }

            break;
        case 3:
                var angleBetween = toRadians(360) / this.numbarrels;
            for (var i = 0; i < this.numbarrels; i += 1) {
                this.weapons[i] = Object.create(this.weaponProto);
                this.weapons[i].setDirection(i * angleBetween);
                app.ticker.add(this.weapons[i].reload, this.weapons[i]);
            }
            break;
    }
    this.weaponName = getWeaponName(this);
}

function Weapon(id, power, rarity, type) {
    //A weapon is what creates bullets.

    this.type = app.weaponTypes[type];

    this.rarity = rarity;

    this.entityID = id;

    this.damage = power.mul(this.type.damageMod).mul(this.rarity.statMod);
    
    this.setPow = function (newPow) {
        this.damage = newPow.mul(this.type.damageMod).mul(this.rarity.statMod);
    }

    
    this.direction = 0;

    this.setDirection = function (direction) {
        this.direction = direction;
    }

    this.maxUse = this.type.useTime;
    this.curUse = this.maxUse;
    this.fire = function () {
        if (this.curUse === 0) {
            new Bullet(this, getEntity(this.entityID), this.type.image, getBonusFromReload(this.maxUse, getEntity(this.entityID).team),
                function () {
                    this.tint = getPlayerColour();
                }, [], this.direction);
            this.curUse = getMaxReload(this.maxUse, getEntity(this.entityID).team);
        }
    }

    this.reload = function () {
        if (this.curUse > 0) {
            this.curUse -= 1;
        }
    };
}

function Armour(power, team) {
    this.className = "Armour";

    this.power = power;

    this.team = team

    //console.log(this.power);

    var raritySeed = Math.random();

    if (raritySeed > 0.99) {
        this.rarity = app.rarities[3];
    } else if (raritySeed > 0.9) {
        this.rarity = app.rarities[2];
    } else if (raritySeed > 0.6) {
        this.rarity = app.rarities[1];
    } else {
        this.rarity = app.rarities[0];
    }

    this.getMaxHP = function (upgradePower) {
        if (this.team === 0) {
            return this.power.mul(10).mul(this.rarity.statMod).mul(upgradePower);
        } else {
            return this.power.mul(this.rarity.statMod);
        }
    }

    this.maxHP = this.getMaxHP(app.upgrades.slots[2].power);
    this.curHP = new Decimal(this.maxHP);

    this.maxRegen = 0.2;
    this.curRegen = 0.01;

    this.regenFunction = function () {
        if (app.keys.pause === true) {
            return;
        }
        if (app.tick % 20 == 0) {
            if (this.curHP.lt(this.getMaxHP(app.upgrades.slots[2].power))) {
                this.curHP = this.curHP.add(this.curHP.mul(this.curRegen));
                if (this.curHP.gt(this.getMaxHP(app.upgrades.slots[2].power))) {
                    this.curHP = this.getMaxHP(app.upgrades.slots[2].power);
                }
            }
            if (this.curRegen < this.maxRegen) {
                this.curRegen *= 1.001;
                if (this.curRegen > this.maxRegen) {
                    this.curRegen = this.maxRegen;
                }
            }
        }
    }

    this.delete = function () {
        app.ticker.remove(this.regenFunction, this);
    }

    app.ticker.add(this.regenFunction, this);
}

function LoadArmour(storedArmour) {
    this.className = "Armour";

    this.power = new Decimal(storedArmour.power);
    this.rarity = app.rarities[storedArmour.rarity];

    this.getMaxHP = function (upgradePower) {
        return new Decimal(this.power).mul(10).mul(this.rarity.statMod).mul(upgradePower);
    }

    this.maxHP = this.getMaxHP(app.upgrades.slots[2].power);
    //console.log(this.maxHP);
    this.curHP = new Decimal(this.maxHP);

    this.maxRegen = 0.2;
    this.curRegen = 0.01;

    this.regenFunction = function () {
        if (app.keys.pause === true) {
            return;
        }
        if (app.tick % 20 == 0) {
            if (this.curHP.lt(this.getMaxHP(app.upgrades.slots[2].power))) {
                this.curHP = this.curHP.add(this.curHP.mul(this.curRegen));
                if (this.curHP.gt(this.getMaxHP(app.upgrades.slots[2].power))) {
                    this.curHP = this.getMaxHP(app.upgrades.slots[2].power);
                }
            }
            if (this.curRegen < this.maxRegen) {
                this.curRegen *= 1.001;
                if (this.curRegen > this.maxRegen) {
                    this.curRegen = this.maxRegen;
                }
            }
        }
    }

    this.delete = function () {
        app.ticker.remove(this.regenFunction, this);
    }

    app.ticker.add(this.regenFunction, this);
}

function PopUpEntity(position, text, value) {

    var style = {
        fontFamily: "Arial",
        fontSize: 12,
        fill: "#000000",
        wordWrap: true,
        wordWrapWidth: 200,
    };
    if (value === -1) {
        PIXI.Text.call(this, text, style);   
    } else {
        PIXI.Text.call(this, text + formatNumber(value), style);   
    }

    this.style = style;

    this.team = -1;

    this.tint = "000000";

    Moveable.call(this, 2);
    this.curLifetime = 30;
    //this.tint = "000000";
    this.anchor.set(0.5, 0.5);

    this.position.copy(position);

    this.accel = setAccelInDirection(toRadians(270), 2);

    //Cleanup function for when this bullet gets deleted.
    this.delete = function () {

        app.ticker.remove(this.update, this);
        app.ticker.remove(this.tick, this);
        app.players.removeChild(this);

        this.destroy();

        return;
    }

    this.tick = function () {

        this.curLifetime -= 1;

        if (this.curLifetime <= 10) {
            this.alpha = this.curLifetime * 0.1;
        }

        if (this.curLifetime <= 0) {
            this.delete();
        }
    }
    app.ticker.add(this.tick, this);
    app.players.addChild(this);
}

function Bullet(weapon, entity, texture, bonusDamage, moveFunction, moveConsts, direction) {
    PIXI.Sprite.call(this, app.bulletImages[texture]);
    this.weapon = weapon;

    //this.cacheAsBitmap = true;

    this.tint = entity.colour;

    this.damage = new Decimal(this.weapon.damage).mul(bonusDamage);

    this.entity = entity;

    this.critMult = 1;

    this.numPierce = 1;
    this.lastEnemyHit = -1;

    Moveable.call(this, this.weapon.type.speed);
    this.move = moveFunction;
    this.moveConsts = moveConsts;
    this.curLifetime = this.weapon.type.lifetime;
    //this.tint = "000000";
    this.anchor.set(0.5, 0.5);
    this.visible = app.keys.hideBullets;

    this.position.copy(this.entity.position);

    this.target = null;

    this.direction = getAngleInRadians(this.position, this.entity.weaponTarget) + direction;
    this.rotation = this.direction;

    this.position.copy(moveToPoint(this.entity.position, this.entity.weaponTarget, 10));

    this.accel = setAccelInDirection(this.direction, this.speed);
    //this.accel.x += this.entity.accel.x;
    //this.accel.y += this.entity.accel.y;

    this.homing = false;
    this.crit = false;
    this.pierce = false;

    for (var i = 0; i < this.entity.weapon.effects.length; i += 1) {
        if (this.entity.weapon.effects[i] === "Homing") {
            this.homing = true;
        }
        if (this.entity.weapon.effects[i] === "Critical") {
            this.crit = true;
        }
        if (this.entity.weapon.effects[i] === "Pierce") {
            this.pierce = true;
            this.numPierce = Math.ceil(Math.log10(this.entity.weapon.power));
        }
    }

    //Cleanup function for when this bullet gets deleted.
    this.delete = function () {

        app.ticker.remove(this.update, this);
        app.ticker.remove(this.tick, this);
        app.particles.removeChild(this);

        this.destroy();

        return;
    }

    this.tick = function () {
        this.visible = app.keys.hideBullets;
        if (app.keys.pause === true) {
            return;
        }

        this.curLifetime -= 1;

        if (this.curLifetime <= 10) {
            this.alpha = this.curLifetime * 0.1;
        }

        if ((this.curLifetime == 0) || collidingWithWall(this.position)) {
            this.delete();
            return;
        }

        if (this.homing === true) {
            this.target = null;
            var closestDistance = 1000000000000000;
            if (this.entity.team === 0) {
                for (var i = 2; i < app.players.children.length; i += 1) {
                    if ((getDistanceFrom(offsetPoint(this.position, this.weapon.type.size, this.weapon.type.size), app.players.getChildAt(i).position) < closestDistance) &&
                        (Math.abs(this.direction - getAngleInRadians(offsetPoint(this.position, this.weapon.type.size, this.weapon.type.size), app.players.getChildAt(i).position)) < 90) &&
                        (app.players.getChildAt(i).team === 1)) {
                        closestDistance = getDistanceFrom(offsetPoint(this.position, this.weapon.type.size, this.weapon.type.size), app.players.getChildAt(i).position);
                        this.target = app.players.getChildAt(i).position;
                    }
                }
            } else if ((this.entity.team === 1) && (Math.abs(this.direction - getAngleInRadians(offsetPoint(this.position, this.weapon.type.size, this.weapon.type.size), app.player.position)) < 90)) {
                this.target = app.player.position;
            }

            if (this.target !== null) {

                var maxRotation = toRadians(5);

                var angleToRotate = getAngleInRadians(this.position, this.target);

                if (Math.abs(angleToRotate - this.direction) > maxRotation) {
                    if (angleIsLeft(this.direction, angleToRotate)) {
                        this.direction -= maxRotation;
                    } else {
                        this.direction += maxRotation;
                    }
                    if (this.direction < 0) {
                        this.direction += toRadians(360);
                    }
                    if (this.direction > toRadians(360)) {
                        this.direction -= toRadians(360);
                    }
                } else {
                    this.direction = angleToRotate;
                }
                this.rotation = this.direction;

                //this.position.copy(moveToPoint(this.entity.position, target, 10));

                this.accel = setAccelInDirection(this.direction, this.speed);
            }
        }

        if (this.entity.team == 0) {
            //Player bullet hit enemy
            for (var n = 0; n < app.players.children.length; n += 1) {
                if ((this.weapon.type.collisionType === "circle") &&
                    (circularCollision(this.weapon.type.size, app.players.getChildAt(n).size, this.position, app.players.getChildAt(n).position)) &&
                    (app.players.getChildAt(n).team != this.entity.team)) {
                    if (this.lastEnemyHit === n) {
                        return;
                    }
                    this.lastEnemyHit = n;
                    if (this.crit === true) {
                        var power = this.entity.weapon.power,
                            critRate = power.exponent * 5 / 100,
                            critMult = new Decimal(1.03).pow(power.log10()),
                            randomSeed = Math.random();
                        if (critRate > 1) {
                            critRate = 1;
                        }

                        if (randomSeed < critRate) {
                            this.critMult = critMult;
                        }
                    }
                    new PopUpEntity(this.position, "", this.damage.mul(this.critMult).mul(app.upgrades.slots[1].power));
                    app.players.getChildAt(n).armour.curHP = app.players.getChildAt(n).armour.curHP.sub(this.damage.mul(this.critMult).mul(app.upgrades.slots[1].power));
                    if (app.players.getChildAt(n).armour.curHP.lte(0)) {
                        app.money.moneyGainedIn5Sec[app.money.moneyGainedSec] = app.money.moneyGainedIn5Sec[app.money.moneyGainedSec].add(app.power.mul(10).mul(app.upgrades.slots[0].power));
                        app.wave.playersOnScreen -= 1;
                        app.players.getChildAt(n).delete();
                        app.wave.enemiesOnScreen -= 1;
                    }
                    this.numPierce -= 1;
                    if (this.numPierce <= 0) {
                        this.delete();
                        return;
                    }
                    return;
                }
            }
        } else {
            //Enemy bullet hit player

            if ((this.weapon.type.collisionType === "circle") &&
                (circularCollision(this.weapon.type.size, app.player.size, this.position, app.player.position)) &&
                (this.lastEnemyHit != app.player)) {
                if (this.crit === true) {
                    var power = this.entity.weapon.power,
                        critRate = power.exponent * 5 / 100,
                        critMult = new Decimal(1.2).pow(power.log2()),
                        randomSeed = Math.random();
                    if (critRate > 1) {
                        critRate = 1;
                    }

                    if (randomSeed < critRate) {
                        this.critMult = critMult;
                    }
                }
                new PopUpEntity(this.position, "", new Decimal(this.damage).mul(this.critMult));
                app.player.armour.curHP = app.player.armour.curHP.sub(this.damage.mul(this.critMult));
                this.delete();
                return;
            }
        }
    }
    app.ticker.add(this.tick, this);
    app.particles.addChild(this);
}

function Notification(text) {
    PIXI.Container.call(this);
    this.type = "Notification";
    
    var textStyle = {
        fontFamily: "Arial",
        fontSize: 12,
        fill: "black",
        wordWrap: false,
        wordWrapWidth: 200,
        justify: "centre"
    };
    
    this.text = new PIXI.Text(text + "\n Click this box to close this.", textStyle);
    
    this.text.position.set(10, 10);
    this.addChild(this.text);
    
    this.background = genBoxSprite(this.width + 15, this.height + 15, 2, 0x000000, 0xFFFFFF);
    this.addChild(this.background);
    this.swapChildren(this.text, this.background);
    
    this.position.set(app.renderer.width / 2 - (this.width / 2), app.renderer.height / 2 - (this.height / 2) - 200);
    
    this.interactive = true;
    this.buttonMode = true;
    
    this.click = function(e) {
        this.destroy();
    }
    
    app.stage.addChild(this);
}

function UpgradeArea(text, x, y, startingPrice, costScaling, startingPower, powerScaling, startingLevel, percentBonus, id) {
    PIXI.Container.call(this);
    this.position.set(x, y);
    this.interactiveChildren = true;
    this.percentBonus = percentBonus;
    this.background = genBoxSprite(app.upgrades.backgroundImage.width / 2 - 10, 100, 2, 0x000000, 0xFFFFFF);
    this.addChild(this.background);
    this.basePrice = new Decimal(startingPrice);
    this.price = new Decimal(startingPrice);
    this.priceMult = new Decimal(costScaling);
    this.power = new Decimal(startingPower);
    this.powerMult = new Decimal(powerScaling);
    this.level = startingLevel;
    this.textStyle = {
        fontFamily: "Arial",
        fontSize: 12,
        fill: "black",
        wordWrap: false,
        wordWrapWidth: this.background.width,
        justify: "centre"
    };
    this.upgradeText = text;
    this.id = id;

    this.getText = function () {
        if (this.percentBonus === true) {
            return this.upgradeText.replace("val1", formatNumber(this.power.mul(100))).replace("val2", formatNumber(this.price)).replace("val3", this.level);
        } else {
            return this.upgradeText.replace("val1", this.power).replace("val2", formatNumber(this.price)).replace("val3", this.level);
        }
    }
    this.text = new PIXI.Text(this.getText(), this.textStyle);
    this.addChild(this.text);
    this.text.position.set(4, 4);

    this.button = genBoxSprite(96, 46, 2, 0x000000, 0xFFFFFF);
    this.addChild(this.button);
    this.button.position.set(46, 50);
    if (app.unlocks.upgrades < this.id) {
        this.visible = false;
        this.button.interactive = false;
    } else {
        this.button.interactive = true;
    }
    this.button.buttonMode = true;
    this.button.parent = this;
    app.upgrades.upgradesArea.addChild(this);
    this.button.click = function (e) {
        if (app.money.curMoney.lt(this.parent.price)) {
            return;
        } else {
            if (app.upgrades.buyButton.buyType === "single") {
                app.money.curMoney = app.money.curMoney.sub(this.parent.price);
                this.parent.price = this.parent.basePrice.mul(this.parent.priceMult.pow(this.parent.level + 1));
                if (this.parent.percentBonus === true) {
                    this.parent.power = this.parent.powerMult.pow(this.parent.level);
                } else {
                    this.parent.power = this.parent.power.add(this.parent.powerMult);
                }
                this.parent.level += 1;
            } else if (app.upgrades.buyButton.buyType === "max") {
                this.maxLevels = Math.floor(app.money.curMoney.div(this.parent.basePrice).log(this.parent.priceMult)) + 1;
                this.parent.price = this.parent.basePrice.mul(this.parent.priceMult.pow(this.maxLevels));
                if (this.parent.percentBonus === true) {
                    this.parent.power = this.parent.powerMult.pow(this.maxLevels);
                } else {
                    this.parent.power = this.parent.power.add(this.parent.powerMult.mul(this.maxLevels));
                }
                this.parent.level = this.maxLevels;
                app.money.curMoney = app.money.curMoney.sub(this.parent.basePrice.mul(this.parent.priceMult.pow(this.maxLevels - 1)));
            }
            this.parent.text.text = this.parent.getText();
            if (this.parent.id === 2) {
                app.player.armour.curHP = app.player.armour.getMaxHP(this.parent.power);
            }
        }
        updateInventoryText();
    }
    this.setLevel = function (level) {
        //console.log(level);
        this.maxLevels = level;
        this.price = this.basePrice.mul(this.priceMult.pow(this.maxLevels));
        if (this.percentBonus === true) {
            this.power = this.powerMult.pow(this.maxLevels);
        } else {
            this.power = this.power.add(this.powerMult.mul(this.maxLevels));
        }
        this.level = this.maxLevels;
        this.text.text = this.getText();
    }
    this.updateText = function () {
        this.text.text = this.getText();
    }
}

Entity.prototype = Object.create(PIXI.Container.prototype);
Bullet.prototype = Object.create(PIXI.Sprite.prototype);
PopUpEntity.prototype = Object.create(PIXI.Text.prototype);
UpgradeArea.prototype = Object.create(PIXI.Container.prototype);
Notification.prototype = Object.create(PIXI.Container.prototype);

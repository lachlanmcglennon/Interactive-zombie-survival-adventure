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
    this.autofire = false;
    this.pause = false;
    this.sell = false;
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
    
    this.addChild(this.image);

    this.colour = colour;

    this.image.tint = this.colour;
    
    this.healthBarArea = new PIXI.Container();
    
    this.healthBarArea.addChild(genBoxSprite(50, 10, 2, 0x000000, 0x222222));
    this.healthBarArea.addChild(genBoxSprite(46, 6, 1, 0x000000, 0x00FC00));
    
    this.healthBarArea.getChildAt(1).position.set(2, 2);
    
    this.healthBarArea.position.set(this.position.x - 25, this.position.y - 40);
    
    this.addChild(this.healthBarArea);

    //Power of this entity based on the current wave.
    this.power = power;

    this.team = team;

    this.weapon = new WeaponGroup(this, power, team);

    //this.interactive = true;
    this.hitArea = new PIXI.Circle(0, 0, 10);

    this.position.set(x, y);

    this.image.anchor.set(0.5, 0.5);

    Moveable.call(this, speed);

    this.size = size;

    this.moveTarget = new PIXI.Point();
    this.weaponTarget = new PIXI.Point();

    this.armour = new Armour(this, this.power);

    if (this.team == 0) {
        PlayerAI.call(this);
    } else {
        this.weapon.weaponProto.type.ai.call(this);
    }

    this.delete = function () {
        app.players.removeChild(this);
        app.ticker.remove(this.tick, this);
        app.ticker.remove(this.update, this);
        app.ticker.remove(this.testWallCollision, this);

        this.destroy();
    };

    app.players.addChild(this);
    
    this.updateHealthBar = function () {
        this.healthBarArea.getChildAt(1).width = 46 * (this.armour.curHP / this.armour.maxHP);
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

function WeaponGroup(entity, power, team) {
    //0 for player, 1 for enemy.
    this.team = team;
    this.weapons = [];

    this.className = "Weapon";

    this.effects = [];

    this.power = power;

    var maxDeviation = toRadians(90);
    this.numbarrels = Math.ceil(Math.random() * 8);
    this.weaponPlaceType = Math.ceil(Math.random() * 3);
    //this.weaponPlaceType = 2;

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

    this.maxNumEffects = this.rarity.effectSlots;

    raritySeed = Math.random();

    for (var i = 0; i < effectTypes.length; i += 1) {
        this.effects.push(effectTypes[i]);
    }


    while (this.effects.length > this.maxNumEffects) {
        this.effects.splice(Math.floor(raritySeed * this.effects.length), 1);
        raritySeed = Math.random();
    }


    this.weaponProto = new Weapon(entity, this.power / this.numbarrels, this);
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

function Weapon(entity, power, weaponGroup) {
    //A weapon is what creates bullets.

    this.type = app.weaponTypes[Math.floor(Math.random() * app.weaponTypes.length)];
    this.bulletTexture = this.type.image;
    this.entity = entity;
    this.group = weaponGroup;

    this.damage = power * this.type.damageMod * this.group.rarity.statMod;
    this.direction = 0;

    this.setDirection = function (direction) {
        this.direction = direction;
    }

    this.maxUse = this.type.useTime;
    this.curUse = this.maxUse;
    this.fire = function () {
        if (this.curUse === 0) {
            new Bullet(this, this.bulletTexture,
                function () {
                    this.tint = entity.colour;
                }, [], this.direction);

            this.curUse = this.maxUse;
        }
    }

    this.reload = function () {
        if (this.curUse > 0) {
            this.curUse -= 1;
        }
    };
}

function Armour(entity, power) {
    this.entity = entity;

    this.className = "Armour";

    this.power = power;

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

    this.maxHP = this.power * 10 * this.rarity.statMod;
    this.curHP = this.maxHP;

    this.maxRegen = 1.2;
    this.curRegen = 1;

    app.ticker.add(function () {
        if (app.tick % 20 == 0) {
            if (this.curHP < this.maxHP) {
                this.curHP *= this.curRegen;
                if (this.curHP > this.maxHP) {
                    this.curHP = this.maxHP;
                }
            }
            if (this.curRegen < this.maxRegen) {
                this.curRegen *= 1.0001;
                if (this.curRegen > this.maxRegen) {
                    this.curRegen = this.maxRegen;
                }
            }
        }
    }, this);
}

function PopUpEntity(bullet, text) {

    var style = {
        fontFamily: "Arial",
        fontSize: 12,
        fill: "#000000",
        wordWrap: true,
        wordWrapWidth: 200,
    };

    PIXI.Text.call(this, formatNumber(text), style);

    this.style = style;

    this.team = -1;

    this.tint = "000000";

    Moveable.call(this, 2);
    this.curLifetime = 30;
    //this.tint = "000000";
    this.anchor.set(0.5, 0.5);

    this.position.copy(bullet.position);

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

function Bullet(weapon, texture, moveFunction, moveConsts, direction) {
    PIXI.Sprite.call(this, texture);
    this.weapon = weapon;

    //this.cacheAsBitmap = true;

    this.tint = this.weapon.entity.colour;

    this.damage = this.weapon.damage;

    this.critMult = 1;
    
    this.numPierce = 1;
    this.lastEnemyHit = {};

    Moveable.call(this, this.weapon.type.speed);
    this.move = moveFunction;
    this.moveConsts = moveConsts;
    this.curLifetime = this.weapon.type.lifetime;
    //this.tint = "000000";
    this.anchor.set(0.5, 0.5);

    this.position.copy(this.weapon.entity.position);

    this.direction = getAngleInRadians(this.position, this.weapon.entity.weaponTarget) + direction;
    this.rotation = this.direction;

    this.position.copy(moveToPoint(this.weapon.entity.position, this.weapon.entity.weaponTarget, 10));

    this.accel = setAccelInDirection(this.direction, this.speed);
    //this.accel.x += this.entity.accel.x;
    //this.accel.y += this.entity.accel.y;

    this.homing = false;
    this.crit = false;
    this.pierce = false;

    for (var i = 0; i < this.weapon.group.effects.length; i += 1) {
        if (this.weapon.group.effects[i] === "Homing") {
            this.homing = true;
        }
        if (this.weapon.group.effects[i] === "Critical") {
            this.crit = true;
        }
        if (this.weapon.group.effects[i] === "Pierce") {
            this.pierce = true;
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
            var target = this.weapon.entity.weaponTarget,
                closestDistance = 1000000000000000;
            if (this.weapon.entity.team === 0) {
                for (var i = 2; i < app.players.children.length; i += 1) {
                    if ((getDistanceFrom(this.position, app.players.getChildAt(i).position) < closestDistance)) {
                        closestDistance = getDistanceFrom(this.position, app.players.getChildAt(i).position);
                        target = app.players.getChildAt(i).position;
                    }
                }
            } else if (this.weapon.entity.team === 1) {
                target = app.player.position;
            }



            var maxRotation = toRadians(5);

            var angleToRotate = getAngleInRadians(this.position, target);

            if (Math.abs(angleToRotate - this.direction) > maxRotation) {
                if (angleIsLeft(this.direction, angleToRotate)) {
                    this.direction -= maxRotation;
                } else {
                    this.direction += maxRotation;
                }
            } else {
                this.direction = angleToRotate;
            }
            this.rotation = this.direction;

            //this.position.copy(moveToPoint(this.weapon.entity.position, target, 10));

            this.accel = setAccelInDirection(this.direction, this.speed);
        }

        if (this.weapon.entity.team == 0) {
            //Player bullet hit enemy
            for (var n = 0; n < app.players.children.length; n += 1) {
                if ((this.weapon.type.collisionType === "circle") && (circularCollision(this.weapon.type.size, app.players.getChildAt(n).size, this.position, app.players.getChildAt(n).position)) && (app.players.getChildAt(n).team != this.weapon.entity.team)) {
                    if (this.crit === true) {
                        var power = this.weapon.group.power,
                            critRate = Math.abs(Math.log10(power) * 5) / 100,
                            critMult = Math.log2(power),
                            randomSeed = Math.random();
                        if (critRate > 1) {
                            critRate = 1;
                        }

                        if (randomSeed < critRate) {
                            this.critMult = critMult;
                        }
                    }
                    new PopUpEntity(this, (this.damage * this.critMult));
                    app.players.getChildAt(n).armour.curHP -= this.damage * this.critMult;
                    if (app.players.getChildAt(n).armour.curHP <= 0) {
                        app.money.moneyGainedIn5Sec[app.money.moneyGainedSec] += app.players.getChildAt(n).power / app.wave.enemyFactor;
                        app.wave.playersOnScreen -= 1;
                        app.players.getChildAt(n).delete();
                        app.wave.enemiesOnScreen -= 1;
                    }
                    this.delete();
                    return;
                }
            }
        } else {
            //Enemy bullet hit player

            if ((this.weapon.type.collisionType === "circle") &&
                (circularCollision(this.weapon.type.size, app.player.size, this.position, app.player.position))) {
                if (this.crit === true) {
                    var power = this.weapon.group.power,
                        critRate = Math.abs(Math.log10(power) * 5) / 100,
                        critMult = Math.log2(power),
                        randomSeed = Math.random();
                    if (critRate > 1) {
                        critRate = 1;
                    }

                    if (randomSeed < critRate) {
                        this.critMult = critMult;
                    }
                }
                new PopUpEntity(this, this.damage * this.critMult);
                app.player.armour.curHP -= this.damage * this.critMult;
                if (app.player.armour.curHP <= 0) {
                    app.wave.number = 0;
                    app.wave.playersInWave = 1;
                    app.wave.playersOnScreen = 0;
                    for (var n = 0; n < app.players.length; n += 1) {
                        app.players.getChildAt(n).delete();
                        app.players.splice(n, 1);
                        n -= 1;
                    }
                    app.power = 1;
                    app.player.armour.curHP = app.player.armour.maxHP;
                }
                this.delete();
                return;
            }
        }
    }
    app.ticker.add(this.tick, this);
    app.particles.addChild(this);
}

Entity.prototype = Object.create(PIXI.Container.prototype);
Bullet.prototype = Object.create(PIXI.Sprite.prototype);
PopUpEntity.prototype = Object.create(PIXI.Text.prototype);

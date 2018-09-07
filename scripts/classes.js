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
                this.displayBox.position.set(this.position.x - this.displayBox.width, this.position.y);
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
        this.position.x += this.accel.x;
        this.position.y += this.accel.y;
    };

    app.ticker.add(this.update, this);
}

function Entity(texture, colour, power, speed, size, team, x, y) {
    //An entity is any kind of controlled character on stage, player or enemy.
    PIXI.Sprite.call(this, texture);

    this.colour = colour;

    this.tint = this.colour;

    //Power of this entity based on the current wave.
    this.power = power;

    this.team = team;

    this.weapon = new WeaponGroup(this, power, team);

    this.interactive = true;
    this.hitArea = new PIXI.Circle(0, 0, 10);

    this.position.set(x, y);

    this.anchor.set(0.5, 0.5);

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
    };

    app.players.addChild(this);
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

    app.ticker.add(this.testWallCollision, this);
}

function WeaponGroup(entity, power, team) {
    //0 for player, 1 for enemy.
    this.team = team;
    this.weapons = [];

    this.className = "Weapon";

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
            app.bullets.push(new Bullet(this, this.bulletTexture,
                function () {
                    this.tint = entity.colour;
                }, [], this.direction));

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

function Bullet(weapon, texture, moveFunction, moveConsts, direction) {
    PIXI.Sprite.call(this, texture);
    this.weapon = weapon;

    //this.cacheAsBitmap = true;

    this.tint = this.weapon.entity.colour;

    this.damage = this.weapon.damage;

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

    //Cleanup function for when this bullet gets deleted.
    this.delete = function (bullets, i) {
        app.ticker.remove(this.update);
        app.ticker.remove(this.tick);
        bullets.splice(i, 1);
        app.particles.removeChild(this);
        return;
    }

    this.tick = function (bullets, i) {
        this.curLifetime -= 1;

        if (this.curLifetime <= 10) {
            this.alpha = this.curLifetime * 0.1;
        }

        if ((this.curLifetime == 0) || collidingWithWall(this.position)) {
            this.delete(bullets, i);
            return;
        }

        if (this.weapon.entity.team == 0) {
            for (var n = 0; n < app.enemies.length; n += 1) {
                if ((this.weapon.type.collisionType === "circle") &&
                    (circularCollision(this.weapon.type.size, app.enemies[n].size, this.position, app.enemies[n].position))) {
                    app.enemies[n].armour.curHP -= this.damage;
                    if (app.enemies[n].armour.curHP <= 0) {
                        app.money.moneyGainedIn5Sec[app.money.moneyGainedSec] += app.enemies[n].power / app.wave.enemyFactor;
                        app.wave.enemiesOnScreen -= 1;
                        app.enemies[n].delete();
                        app.enemies.splice(n, 1);
                        n -= 1;
                    }
                    this.delete(bullets, i);
                }
            }
        } else {
            if ((this.weapon.type.collisionType === "circle") &&
                (circularCollision(this.weapon.type.size, app.player.size, this.position, app.player.position))) {
                app.player.armour.curHP -= this.damage;
                if (app.player.armour.curHP <= 0) {
                    app.wave.number = 0;
                    app.wave.enemiesInWave = 1;
                    app.wave.enemiesOnScreen = 0;
                    for (var n = 0; n < app.enemies.length; n += 1) {
                        app.enemies[n].delete();
                        app.enemies.splice(n, 1);
                        n -= 1;
                    }
                    app.power = 1;
                    app.player.armour.curHP = app.player.armour.maxHP;
                }
                this.delete(bullets, i);
            }
        }
    }
    app.particles.addChild(this);
}

Entity.prototype = Object.create(PIXI.Sprite.prototype);
Bullet.prototype = Object.create(PIXI.Sprite.prototype);

//This file constains prototype definitions for all new objects in the game.

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
}

function Mouse() {
    this.position = new PIXI.Point(0, 0);
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

function Entity(texture, colour, power, speed, team, x, y) {
    //An entity is any kind of controlled character on stage, player or enemy.
    PIXI.Sprite.call(this, texture);
    
    this.colour = colour;
    
    this.tint = this.colour;
    
    this.power = power;
    
    this.interactive = true;
    this.hitArea = new PIXI.Circle(0, 0, 10);
    
    this.position.set(x, y);
    
    this.anchor.set(0.5, 0.5);
    
    Moveable.call(this, speed);
    
    this.moveTarget = new PIXI.Point();
    this.weaponTarget = new PIXI.Point();
    
    this.team = team;
    this.weapons = [];
    this.numbarrels = 1;
    this.weaponPlaceType = 1;
    this.weaponProto = new Weapon(this, power / this.numbarrels);
    
    this.newWeapon = function(power) {
        this.weapons = [];
        var maxDeviation = toRadians(90);
        this.numbarrels = Math.ceil(Math.random() * 8);
        this.weaponPlaceType = Math.ceil(Math.random() * 3);
        //this.weaponPlaceType = 2;

        switch (this.weaponPlaceType) {
            default:
                this.weaponProto = new Weapon(this, power);
                this.weapons[0] = Object.create(this.weaponProto);
                app.ticker.add(this.weapons[0].reload, this.weapons[0]);
                break;
            case 2:
                this.weaponProto = new Weapon(this, power / this.numbarrels);
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
                this.weaponProto = new Weapon(this, power / this.numbarrels);
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
    this.newWeapon(this.power);
    
    this.armour = new Armour(this, this.power);
    
    if (this.team == 0) {
        PlayerAI.call(this);
    } else {
        this.weaponProto.type.ai.call(this);
    }
    
    this.delete = function () {
        app.stage.removeChild(this);
        app.ticker.remove(this.tick, this);
    };
        
    app.stage.addChild(this);
    app.ticker.add(function () {
        this.hitArea.x = this.position.x - 5;
        this.hitArea.y = this.position.y - 5;
    },this);
}

function Weapon(entity, power) {
    //A weapon is what creates bullets.
    
    this.type = weaponTypes[Math.floor(Math.random() * weaponTypes.length)];
    this.bulletTexture = app.renderer.generateTexture(this.type.image);
    this.entity = entity;
    
    this.damage = power * this.type.damageMod;
    this.direction = 0;
    
    this.setDirection = function(direction) {
        this.direction = direction;
    }
    
    this.maxUse = this.type.useTime;
    this.curUse = this.maxUse;
    this.fire = function() {
        if (this.curUse === 0) {
            app.bullets.push(new Bullet(this, this.bulletTexture, 
            function() {
                this.tint = entity.colour;
            }, [], this.direction));
            
            this.curUse = this.maxUse;
        }
    }
    
    this.reload = function () {
        if(this.curUse > 0) {
            this.curUse -= 1;
        }
    };
}

function Armour(entity, power) {
    this.entity = entity;
    
    this.maxHP = power * 10;
    this.curHP = this.maxHP;
    
    this.maxRegen = 1.2;
    this.curRegen = 1;
    
    app.ticker.add(function() {
        if (app.tick % 6 == 0) {
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
    
    this.cacheAsBitmap = true;
    
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
    
    this.tick = function(bullets, i) {
        this.curLifetime -= 1;
        
        if (this.curLifetime <= 10) {
            this.alpha = this.curLifetime * 0.1;
        }
        
        if (this.curLifetime == 0) {
            bullets.splice(i, 1);
            app.particles.removeChild(this);
            return;
        }
        
        if(this.weapon.entity.team == 0) {
            for (var n = 0; n < app.enemies.length; n += 1) {
                if (app.enemies[n].hitArea.contains(this.position.x, this.position.y)) {
                    app.enemies[n].armour.curHP -= this.damage;
                    if (app.enemies[n].armour.curHP <= 0) {
                        app.money.moneyGainedIn5Sec[app.money.moneyGainedSec] += app.enemies[n].power / app.wave.enemyFactor;
                        app.wave.enemiesOnScreen -= 1;
                        app.enemies[n].delete();
                        app.enemies.splice(n, 1);
                        n -= 1;
                    }
                    bullets.splice(i, 1);
                    app.particles.removeChild(this);
                }
            }
        } else {
            if (app.player.hitArea.contains(this.position.x, this.position.y)) {
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
                    bullets.splice(i, 1);
                    app.particles.removeChild(this);
                }
        }
    }
    
    app.particles.addChild(this);
}

Entity.prototype = Object.create(PIXI.Sprite.prototype);
Bullet.prototype = Object.create(PIXI.Sprite.prototype);
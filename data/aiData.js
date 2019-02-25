function PlayerAI() {
    this.tick = function () {
        if (app.keys.pause === true) {
            return;
        }
        if (app.keys.mouseLeft == true || app.keys.autofire === true) {
            for (var i = 0; i < this.weapon.weapons.length; i += 1) {
                this.weapon.weapons[i].fire();
            }
        }

        var moveBorderX = app.renderer.width / 4;
        var moveBorderY = app.renderer.height / 4;

        if (app.keys.d == true || app.keys.a == true) {
            if (app.keys.d == true && app.keys.a == true) {
                this.accel.x = 0;
            } else {
                if (app.keys.d == true) {
                    this.accel.x = this.speed;
                }
                if (app.keys.a == true) {
                    this.accel.x = -this.speed;
                }
            }
        } else {
            this.accel.x -= this.accel.x / 10;
        }
        if (app.keys.s == true || app.keys.w == true) {
            if (app.keys.s == true && app.keys.w == true) {
                this.accel.y = 0;
            } else {
                if (app.keys.s == true) {
                    this.accel.y = this.speed;
                }

                if (app.keys.w == true) {
                    this.accel.y = -this.speed;
                }
            }
        } else {
            this.accel.y -= this.accel.y / 10;
        }

        if (!collidingWithWallX(this.position)) {
            if (((this.position.x + app.transform.x) - app.renderer.width / 2 > moveBorderX) && (this.accel.x > 0)) {
                app.transform.x -= this.accel.x;
            }

            if (((this.position.x + app.transform.x) - app.renderer.width / 2 < -moveBorderX) && (this.accel.x < 0)) {
                app.transform.x -= this.accel.x;
            }
        }

        if (!collidingWithWallY(this.position)) {
            if (((this.position.y + app.transform.y) - app.renderer.height / 2 > moveBorderY) && (this.accel.y > 0)) {
                app.transform.y -= this.accel.y;
            }

            if (((this.position.y + app.transform.y) - app.renderer.height / 2 < -moveBorderY) && (this.accel.y < 0)) {
                app.transform.y -= this.accel.y;
            }
        }

        if (((this.accel.x !== 0) || (this.accel.y !== 0))) {
            app.players.setTransform(app.transform.x, app.transform.y);
            app.particles.setTransform(app.transform.x, app.transform.y);
        }

        if (app.keys.mouseLocked === false) {
            this.weaponTarget = app.mouse.position;
            this.image.rotation = getAngleInRadians(this.position, app.mouse.position);
        } else {
            this.autoDirection += toRadians(0.5);
            if (this.autoDirection > toRadians(360)) {
                this.autoDirection = 0;
            }
            var newPos = moveInDirection(this.position, 2, this.autoDirection);
            this.accel.x = this.position.x - newPos.x;
            this.accel.y = this.position.y - newPos.y;
            var closestDistance = 1000000000,
                closestEnemy = -1;
            for (var i = 2; i < app.players.children.length; i += 1) {
                if ((getDistanceFrom(this.position, app.players.children[i].position) < closestDistance) &&
                    (app.players.children[i].team === 1)) {
                    closestDistance = getDistanceFrom(this.position, app.players.children[i].position);
                    closestEnemy = i;
                }
            }
            
            if (closestEnemy != -1) {
                if (intercept(this.position, {x: app.players.children[closestEnemy].position.x, y: app.players.children[closestEnemy].position.y, vx: app.players.children[closestEnemy].accel.x, vy: app.players.children[closestEnemy].accel.y}, app.weaponTypes[this.weapon.weaponType].speed) != null) {
                        this.weaponTarget = intercept(this.position, 
                    {x: app.players.children[closestEnemy].position.x, 
                     y: app.players.children[closestEnemy].position.y, 
                     vx: app.players.children[closestEnemy].accel.x, 
                     vy: app.players.children[closestEnemy].accel.y}, app.weaponTypes[this.weapon.weaponType].speed);
            } else {
                this.weaponTarget = app.player.position;
            }
            this.image.rotation = getAngleInRadians(this.position, this.weaponTarget);
            this.weaponTarget = app.players.children[closestEnemy].position;
            }
            
            
        }

        if ((this.armour.curHP.div(this.armour.getMaxHP(app.upgrades.slots[2].power)).lte(0.2)) && (app.keys.deathPaused === false)) {
            app.stage.addChild(app.pauseText);
            app.keys.deathPaused = true;
            app.keys.pause = true;
            if (this.armour.curHP.lt(0)) {
                this.armour.curHP = this.armour.getMaxHP().mul(0.1);
            }
        } else if (this.armour.curHP.lte(0)) {
            for (var n = 0; n < app.players.children.length; n += 1) {
                if (app.players.children[n].team === 1) {
                    app.players.children[n].delete();
                    n = 1;
                }
                for (var i = 0; i < app.particles.children.length; i += 1) {
                    app.particles.children[i].delete();
                    i = 0;
                }
            }
            app.money.moneyGainBonus = app.money.moneyGainBonus.add(app.wave.number.mul(0.08));
            if (app.wave.number.toNumber() > 1000) {
                app.money.moneyGainBonus = app.money.moneyGainBonus.add(new Decimal(1.8).pow(app.wave.number.sub(1000)));
            }
            
            app.wave = {
                number: new Decimal(0),
                enemiesInWave: 1,
                enemiesOnScreen: 0,
                enemyFactor: new Decimal(0.1),
                factorStartPow: 1.65,
                factorIncrease: 0.15,
                bossSpawned: false
            };
            
            app.unlocks.arenaName = "Unranked ";

            app.power = new Decimal(1);
            this.armour.curHP = this.armour.getMaxHP(app.upgrades.slots[2].power);
            app.keys.deathPaused = false;
            
            
            return;
        } else if (this.armour.curHP.div(this.armour.maxHP).gt(0.2)) {
            app.keys.deathPaused = false;
        }

    }

    app.ticker.add(this.tick, this);
}

function SniperAi() {
    this.tick = function () {
        if (app.keys.pause === true) {
            return;
        }
        if (getDistanceFrom(this.position, app.player.position) > 150) {
            this.moveTarget = moveToPoint(app.player.position, this.position, 150);
            
        } else {
            this.moveTarget = moveInDirection(app.player.position, 150, getAngleInRadians(app.player.position, this.position) + toRadians(10));
        }
        
        for (var i = 2; i < app.players.children.length; i += 1) {
            if ((getDistanceFrom(this.position, app.players.getChildAt(i).position) < 10) && (this != app.players.getChildAt(i)) && (app.players.getChildAt(i).team === 1)) {
                this.moveTarget = moveInDirection(app.players.getChildAt(i).position, 10, getAngleInRadians(app.players.getChildAt(i).position, this.position));
                break;
            }
        }
        this.accel = setAccelToPoint(this.position, this.moveTarget, this.speed);
        if (intercept(this.position, {x: app.player.position.x, y: app.player.position.y, vx: app.player.accel.x, vy: app.player.accel.y}, app.weaponTypes[this.weapon.weaponType].speed) != null) {
            this.weaponTarget = intercept(this.position, {x: app.player.position.x, y: app.player.position.y, vx: app.player.accel.x, vy: app.player.accel.y}, app.weaponTypes[this.weapon.weaponType].speed);
        } else {
            this.weaponTarget = app.player.position;
        }
        this.image.rotation = getAngleInRadians(this.position, this.weaponTarget);
        for (var i = 0; i < this.weapon.weapons.length; i += 1) {
            this.weapon.weapons[i].fire();
        }
    }
    app.ticker.add(this.tick, this);
}

function CloseAi() {
    this.tick = function () {
        if (app.keys.pause === true) {
            return;
        }
        if (getDistanceFrom(this.position, app.player.position) > 50) {
            this.moveTarget = moveToPoint(app.player.position, this.position, 50);
        } else {
            this.moveTarget = moveInDirection(app.player.position, 50, getAngleInRadians(app.player.position, this.position) + toRadians(10));
        }
        for (var i = 2; i < app.players.children.length; i += 1) {
            if ((getDistanceFrom(this.position, app.players.getChildAt(i).position) < 10) && (this != app.players.getChildAt(i))) {
                this.moveTarget = moveInDirection(app.players.getChildAt(i).position, 10, getAngleInRadians(app.players.getChildAt(i).position, this.position));
                break;
            }
        }
        this.accel = setAccelToPoint(this.position, this.moveTarget, this.speed);
        if (intercept(this.position, {x: app.player.position.x, y: app.player.position.y, vx: app.player.accel.x, vy: app.player.accel.y}, app.weaponTypes[this.weapon.weaponType].speed) != null) {
            this.weaponTarget = intercept(this.position, {x: app.player.position.x, y: app.player.position.y, vx: app.player.accel.x, vy: app.player.accel.y}, app.weaponTypes[this.weapon.weaponType].speed);
        } else {
            this.weaponTarget = app.player.position;
        }
        this.image.rotation = getAngleInRadians(this.position, this.weaponTarget);
        for (var i = 0; i < this.weapon.weapons.length; i += 1) {
            this.weapon.weapons[i].fire();
        }
    }
    app.ticker.add(this.tick, this);
}

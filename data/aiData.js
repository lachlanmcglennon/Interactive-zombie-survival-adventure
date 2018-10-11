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

        this.image.rotation = getAngleInRadians(this.position, app.mouse.position);

        this.weaponTarget = app.mouse.position;

        if ((this.armour.curHP / this.armour.getMaxHP() <= 0.2) && (app.keys.deathPaused === false)) {
            app.stage.addChild(app.pauseText);
            app.keys.deathPaused = true;
            app.keys.pause = true;
            if (this.armour.curHP < 0) {
                this.armour.curHP = this.armour.getMaxHP() * 0.1;   
            }
        } else if (this.armour.curHP <= 0) {
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
            app.wave = {
                number: 0,
                enemiesInWave: 1,
                enemiesOnScreen: 0,
                enemyFactor: 1
            };

            app.power = 1;
            this.armour.curHP = this.armour.maxHP;
            app.keys.deathPaused = false;
            return;
        } else if (this.armour.curHP / this.armour.maxHP > 0.2) {
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
            this.accel = setAccelToPoint(this.position, this.moveTarget, this.speed);
        } else {
            this.moveTarget = moveInDirection(app.player.position, 150, getAngleInRadians(app.player.position, this.position) + toRadians(10));
            this.accel = setAccelToPoint(this.position, this.moveTarget, this.speed);
        }
        this.weaponTarget = app.player.position;
        this.image.rotation = getAngleInRadians(this.position, app.player.position);
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
            this.moveTarget = moveToPoint(app.player.position, this.position, 30);
            this.accel = setAccelToPoint(this.position, this.moveTarget, this.speed);
        } else {
            this.moveTarget = moveInDirection(app.player.position, 50, getAngleInRadians(app.player.position, this.position) + toRadians(10));
            this.accel = setAccelToPoint(this.position, this.moveTarget, this.speed);
        }
        this.weaponTarget = app.player.position;
        this.image.rotation = getAngleInRadians(this.position, app.player.position);
        for (var i = 0; i < this.weapon.weapons.length; i += 1) {
            this.weapon.weapons[i].fire();
        }
    }
    app.ticker.add(this.tick, this);
}

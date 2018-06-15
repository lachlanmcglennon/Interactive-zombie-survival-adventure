function PlayerAI() {
    this.tick = function() {
        if (app.keys.mouseLeft == true || app.keys.autofire === true) {
            for(var i = 0; i < this.weapons.length; i += 1) {
                this.weapons[i].fire();   
            }
        }
        
        this.rotation = getAngleInRadians(this.position, app.mouse.position);
        
        this.weaponTarget = app.mouse.position;
        
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
    }
    app.ticker.add(this.tick, this);
}

function SniperAi() {
    this.tick = function() {
        if (getDistanceFrom(this.position, app.player.position) > 150) {
            this.moveTarget = moveToPoint(app.player.position, this.position, 150);
            this.accel = setAccelToPoint(this.position, this.moveTarget, this.speed);
        } else {
            this.accel.set(0, 0);
        }
        this.weaponTarget = app.player.position;
        this.rotation = getAngleInRadians(this.position, app.player.position);
        for(var i = 0; i < this.weapons.length; i += 1) {
            this.weapons[i].fire();   
        }
    }
    app.ticker.add(this.tick, this);
}

function CloseAi() {
    this.tick = function() {
        if (getDistanceFrom(this.position, app.player.position) > 30) {
            this.moveTarget = moveToPoint(app.player.position, this.position, 30);
            this.accel = setAccelToPoint(this.position, this.moveTarget, this.speed);
        } else {
            this.accel.set(0, 0);
        }
        this.weaponTarget = app.player.position;
        this.rotation = getAngleInRadians(this.position, app.player.position);
        for(var i = 0; i < this.weapons.length; i += 1) {
            this.weapons[i].fire();   
        }
    }
    app.ticker.add(this.tick, this);
}
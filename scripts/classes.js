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

function Bullet(weapon, texture, speed, moveFunction, moveConsts) {
    PIXI.Sprite.call(this, texture);
    Moveable.call(this, speed);
    
    this.move = moveFunction;
    this.moveConsts = moveConsts;
    this.curLifetime = 300;
    this.tint = "000000";
    this.anchor.set(0.5, 0.5);
    this.position.copy(player.position);
    
    this.direction = getAngleInRadians(this.position, app.mouse.position);
    
    this.tick = function(bullets, i) {
        this.curLifetime -= 1;
        
        if (this.curLifetime <= 10) {
            this.alpha = this.curLifetime * 0.1;
        }
        
        if (this.curLifetime == 0) {
            bullets.splice(i, 1);
            app.stage.removeChild(this);
            return;
        }
    }
    
    app.stage.addChild(this);
}

Bullet.prototype = Object.create(PIXI.Sprite.prototype);
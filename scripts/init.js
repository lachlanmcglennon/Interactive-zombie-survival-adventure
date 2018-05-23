//This file initiases the default state of the app.

var app;
var player;

function move() {
    if (app.keys.d == true || app.keys.a == true) {
        if (app.keys.d == true && app.keys.a == true) {
            player.accel.x = 0;
        } else {
            if (app.keys.d == true) {
                player.accel.x = player.speed;
            }
            if (app.keys.a == true) {
                player.accel.x = -player.speed;
            }
        }
    } else {
        player.accel.x -= player.accel.x / 10;
    }
    if (app.keys.s == true || app.keys.w == true) {
        if (app.keys.s == true && app.keys.w == true) {
            player.accel.y = 0;
        } else {
            if (app.keys.s == true) {
                player.accel.y = player.speed;
            }

            if (app.keys.w == true) {
                player.accel.y = -player.speed;
            }
        }
    } else {
        player.accel.y -= player.accel.y / 10;
    }
}

function init() {
  app = new PIXI.Application(window.innerWidth, window.innerHeight, {
    // backgroundColor: 0xcccccc
    transparent: true
  });
  document.body.appendChild(app.view);
    
    var particles = new PIXI.particles.ParticleContainer();
    
    var particleG = new PIXI.Graphics();
    
    particleG.beginFill(0xff22aa);
    particleG.drawRect(0, 0, 20, 20);
    particleG.endFill();
    
    var particle = new PIXI.Sprite(PIXI.Texture.WHITE);
    
    particle.position.set(10, 10);
    
    particle.tint = "000000";
    
    particles.addChild(particle);
    
    player = new PIXI.Sprite.fromImage("images/player.png");
    
    app.stage.addChild(player);
    app.stage.addChild(particles);
    
    app.ticker.speed = 1;
    
    app.ticker.start();
    
    app.stage.interactive = true;
    
    app.mouse = new Mouse();
    app.bullets = [];
    
    app.stage.on("mousemove", function (event) {
        app.mouse.position = event.data.getLocalPosition(app.stage);
    }, false);
    
    app.keys = new Keys();
    player.position.set(app.renderer.width / 2, app.renderer.height / 2);
    Moveable.call(player, 1);
    
    player.anchor.set(0.5, 0.5);
    
    app.ticker.add(move);
    
    app.ticker.add(function () {
        player.rotation = getAngleInRadians(player.position, app.mouse.position);
    });
    
    app.ticker.add(function () {
        if (app.keys.mouseLeft == true || app.keys.autofire === true) {
            app.bullets.push(new Bullet({}, 
            PIXI.Texture.WHITE, 1, function() {
            },
            [
                2, [-50, -50, false], [-50, 0, false], 
                [50, 0, true], [50, -50, false], [70, -50, true], [70, 0, false],
                [-70, 20, true], [-70, 70, false], [-50, 70, true], [-50, 20, false], 
                [50, 20, true], [50, 70, false], [70, 70, true], [120, 70, false]
            ]));
            setAccelToPoint(app.bullets.slice(-1)[0].position, app.mouse.position, app.bullets.slice(-1)[0].accel, app.bullets.slice(-1)[0].speed);
            app.bullets.slice(-1)[0].move = function () {
                if (this.position.x == player.position.x + this.moveConsts[this.moveConsts[0]][0] 
                    && this.position.y == player.position.y + this.moveConsts[this.moveConsts[0]][1]) {
                    this.moveConsts[0] += 1;
                    
                    if (this.moveConsts[0] > this.moveConsts.length - 1) {
                        this.moveConsts[0] = 2;
                        this.curLifetime = 1;
                        return;
                    }
                    
                    if (this.moveConsts[this.moveConsts[0]][2] == true) {
                        this.position.x = player.position.x + this.moveConsts[this.moveConsts[0]][0];
                        this.position.y = player.position.y + this.moveConsts[this.moveConsts[0]][1];
                        this.moveConsts[0] += 1;
                    }
                    
                    if (this.moveConsts[0] > this.moveConsts.length - 1) {
                        this.moveConsts[0] = 2;
                        this.curLifetime = 1;
                        return;
                    }
                    
                    this.direction = getAngleInRadians(this.position, new PIXI.Point(
                    player.position.x + this.moveConsts[this.moveConsts[0]][0], 
                    player.position.y + this.moveConsts[this.moveConsts[0]][1]));
                }
                setAccelInDirection(this.accel, this.direction, this.speed);
            }
        }
    });
    
    app.ticker.add(function () {
        for(var i = 0; i < app.bullets.length; i += 1) {
            app.bullets[i].move();
            app.bullets[i].tick(app.bullets, i);
        }
    });
}

// Fullscreen in pixi is resizing the renderer to be window.innerWidth by window.innerHeight
window.addEventListener("resize", function() {
  app.renderer.resize(window.innerWidth, window.innerHeight);
});
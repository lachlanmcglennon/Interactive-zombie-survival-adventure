//This file initiases the default state of the app.

var app = {};

function init() {
  app = new PIXI.Application(window.innerWidth, window.innerHeight, {
    //backgroundColor: 0xcccccc,
    transparent: true,
      antialias: true,
      width: 960,
      height: 540
      
  });
    var gameDiv = document.getElementById("game");
  gameDiv.appendChild(app.view);
    
    function resize() {
        var container = document.getElementById("content");
        var width = container.clientWidth;
        var height = container.clientHeight;
        if (container.clientHeight < 400) {
            height = window.innerHeight - 5;
        } else {
            height = container.clientHeight;
        }
        
        if (width > 960) {
            width = 960;
        }
        
        if (height > 960) {
            height = 540;
        }

        app.renderer.resize(width, height);
    }
    resize();

    window.onresize = resize;
    
    app.particles = new PIXI.particles.ParticleContainer();
    
    app.stage.addChild(app.particles);
    
    var img = new Image();
    img.src = "images/player.png";
    var base = new PIXI.BaseTexture(img);   
    
    app.ticker.speed = 1;
    
    app.ticker.start();
    
    app.tick = 0;
    
    app.stage.interactive = true;
    
    app.mouse = new Mouse();
    app.bullets = [];
    app.enemies = [];
    app.money = {
        curMoney : 0,
        highestMoneyGainRate : 0.1,
        moneyGainedIn5Sec : [],
        moneyGainedSec : 0
    };
    
    app.ticker.add(function () {
        if (app.tick % 60 === 0) {
            app.money.curMoney += app.money.highestMoneyGainRate;
            var average = 0;
            for (var i = 0; i < 5; i += 1) {
                average += app.money.moneyGainedIn5Sec[i];
            }
            average /= 5;
            if (average > app.money.highestMoneyGainRate) {
                app.money.highestMoneyGainRate = average;
            }
            
            app.money.moneyGainedSec += 1;
            if (app.money.moneyGainedSec >= 6) {
                app.money.moneyGainedSec = 0;
            }
            
            app.money.moneyGainedIn5Sec[app.money.moneyGainedSec] = 0;
        }
    });
    
    app.wave = {
        number : 0,
        enemiesInWave: 10,
        enemiesOnScreen: 0,
        enemyFactor: 0.1
    };
    
    app.power = 1;
    
    var player = new Entity(new PIXI.Texture(base), getPlayerColour(), app.power * 10, 2, 0, app.renderer.width / 2, app.renderer.height / 2);
    
    app.stage.addChild(player);
    
    app.player = player;
    
    app.stage.on("mousemove", function (event) {
        app.mouse.position = event.data.getLocalPosition(app.stage);
    }, false);
    
    app.keys = new Keys();
    
    app.ticker.add(function () {
        app.tick += 1;
        
        if (((app.tick % 60 == 0) || (app.wave.enemiesOnScreen == 0)) && (app.wave.enemiesInWave > 0) 
            && (app.wave.enemiesOnScreen < 3)) {
            var xToSpawn = 0, yToSpawn = 0;
            
            if (Math.random() <= 0.5) {
                if (Math.random() <= 0.5) {
                    xToSpawn = 0;
                } else {
                    xToSpawn = app.renderer.width;
                }
                yToSpawn = Math.random() * app.renderer.height;
            } else {
                if (Math.random() <= 0.5) {
                    yToSpawn = 0;
                } else {
                    yToSpawn = app.renderer.height;
                }
                xToSpawn = Math.random() * app.renderer.width;
            }
            
            app.enemies.push(new Entity(new PIXI.Texture(base), genRandomColour(), 
                app.power * app.wave.enemyFactor, 2, 1, xToSpawn, yToSpawn));
            app.wave.enemiesInWave -= 1;
            app.wave.enemiesOnScreen += 1;
        }
        if ((app.wave.enemiesOnScreen == 0) && app.wave.enemiesInWave === 0) {
            app.wave.enemiesInWave = 10;
            app.wave.number += 1;
            app.power *= 1.2;
            app.wave.enemyFactor *= 1.01;
        }
    });
    
    app.ticker.add(function () {
        for(var i = 0; i < app.bullets.length; i += 1) {
            app.bullets[i].move();
            app.bullets[i].tick(app.bullets, i);
        }
    });
    
    app.ticker.add(updateUI);
    
    console.log(app.player);
    addEvents();
}
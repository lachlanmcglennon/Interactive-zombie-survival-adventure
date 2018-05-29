//This file initiases the default state of the app.

var app = {};

function init() {
  app = new PIXI.Application(window.innerWidth, window.innerHeight, {
    //backgroundColor: 0xcccccc,
    transparent: true,
      antialias: true
      
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

        app.renderer.resize(width, height);
    }
    resize();

    window.onresize = resize;
    
    var particles = new PIXI.particles.ParticleContainer();
    
    app.stage.addChild(particles);
    
    var img = new Image();
    img.src = "images/player.png";
    var base = new PIXI.BaseTexture(img),    
    
    player = new Entity(new PIXI.Texture(base), getPlayerColour(), 0, 2, 0, app.renderer.width / 2, app.renderer.height / 2);
    
    app.ticker.speed = 1;
    
    app.ticker.start();
    
    app.tick = 0;
    
    app.stage.interactive = true;
    
    app.mouse = new Mouse();
    app.bullets = [];
    app.enemies = [];
    
    app.stage.addChild(player);
    
    app.player = player;
    
    app.stage.on("mousemove", function (event) {
        app.mouse.position = event.data.getLocalPosition(app.stage);
    }, false);
    
    app.keys = new Keys();
    
    app.ticker.add(function () {
        app.tick += 1;
        
        if (app.tick % 120 == 0) {
            app.enemies.push(new Entity(new PIXI.Texture(base), genRandomColour(), 0, 2, 1, 0, 0));
        }
    });
    
    app.ticker.add(function () {
        for(var i = 0; i < app.bullets.length; i += 1) {
            app.bullets[i].move();
            app.bullets[i].tick(app.bullets, i);
        }
    });
    
    console.log(app.player);
    addEvents();
}
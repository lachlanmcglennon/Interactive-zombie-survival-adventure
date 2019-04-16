var PIXI = require('./scripts/pixi');
var Canvas = require('canvas');
var functions = require('./scripts/functions');
require('./data/aiData.js');
var weapons = require('./data/weaponData');
var rarities = require('./data/rarityData');
var classes = require('./scripts/classes');

test('Create an application and add a player.', () => {
    var app = new PIXI.Application();
    app.players = new PIXI.Container();
    app.stage.addChild(app.players);
    
    var img = new Image();
    img.src = "images/player.png";
    app.playerImage = PIXI.Texture.fromImage(img.src);
    app.functions = new functions.FunctionsClass();
    
    app = weapons.loadBulletImages(app);
    app = rarities.loadRarities(app);
    app.keys = new classes.Keys();
    
    app.player = new classes.Entity(app, new PIXI.Texture(app.playerImage), "0x000000", 1, 3, 5, 0, 500, 500);
    expect(0).toBe(0);
});
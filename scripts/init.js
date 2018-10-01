//This file initiases the default state of the app.

var app = {};

function onload() {
    app = new PIXI.Application(window.innerWidth, window.innerHeight, {
        //backgroundColor: 0xcccccc,
        transparent: true,
        antialias: true,
        width: 960,
        height: 540

    });

    app.ticker.addOnce(init);
}

function init() {
    var gameDiv = document.getElementById("game");
    gameDiv.appendChild(app.view);

    function resize() {
        var container = document.getElementById("content");
        var width = window.innerWidth;
        var height = window.innerHeight - 5;

        if (width > 1920) {
            width = 1920;
        }

        if (height > 1080) {
            height = 1080;
        }

        app.renderer.resize(width, height);
        app.inventory.backgroundImage.height = app.renderer.height;

        if (app.inventory.inventoryArea.enabled) {
            app.inventory.inventoryArea.position.set(width - app.inventory.inventoryArea.width - 10, 0);
        } else {
            app.inventory.inventoryArea.position.set(width - 10, 0);
        }
    }

    app = loadBulletImages(app);
    app = loadRarities(app);

    app.particles = new PIXI.particles.ParticleContainer(
        1000
    );

    app.particles.autoResize = true;

    app.stage.addChild(app.particles);

    app.players = new PIXI.Container();

    app.stage.addChild(app.players);

    var img = new Image();
    img.src = "images/player.png";
    app.playerImage = PIXI.Texture.fromImage(img.src);

    app.ticker.speed = 1;

    app.ticker.start();

    app.tick = 0;

    app.stage.interactive = true;

    app.mouse = new Mouse();
    app.enemies = [];
    app.money = {
        curMoney: 100,
        highestMoneyGainRate: 0.1,
        moneyGainedIn5Sec: [],
        moneyGainedSec: 0
    };

    app.transform = new PIXI.Point(0, 0);

    var wallImage = new PIXI.Graphics();
    wallImage.lineStyle(2, 0x000000);

    wallImage.drawRect(0, 0, app.renderer.width * 3, app.renderer.height * 3);

    app.wall = new PIXI.Sprite(app.renderer.generateTexture(wallImage));

    app.wall.position.set(-app.renderer.width, -app.renderer.height);

    app.players.addChild(app.wall);

    app.ticker.add(function () {
        if (app.keys.pause === true) {
            return;
        }
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
        number: 0,
        enemiesInWave: 1,
        enemiesOnScreen: 0,
        enemyFactor: 0.1
    };
    
    app.settings = {
        format: "sci"
    };

    app.power = 1;

    app.player = new Entity(new PIXI.Texture(app.playerImage), getPlayerColour(), app.power * 10, 3, 5, 0, app.renderer.width / 2, app.renderer.height / 2);

    app.inventory = {};
    app.inventory.backgroundImage = genBoxSprite(522, app.renderer.width, 2, 0x000000, 0xFFFFFF);

    app.inventory.inventoryArea = new PIXI.Container();
    app.inventory.inventoryArea.addChild(app.inventory.backgroundImage);

    app.inventory.inventoryArea.enabled = false;
    app.inventory.inventoryArea.interactive = true;
    app.inventory.inventoryArea.interactiveChildren = true;
    app.inventory.inventoryArea.click = function (e) {
        if (app.inventory.inventoryArea.enabled) {
            app.inventory.inventoryArea.position.x += app.inventory.inventoryArea.width;
            app.keys.pause = false;
        } else {
            app.inventory.inventoryArea.position.x -= app.inventory.inventoryArea.width;
            app.keys.pause = true;
        }
        app.inventory.inventoryArea.enabled = !app.inventory.inventoryArea.enabled;
    }

    app.stage.addChild(app.inventory.inventoryArea);

    app.stage.swapChildren(app.inventory.inventoryArea, app.mouse.displayBox);

    app.inventory.slotAreas = [];
    app.inventory.slot = [];

    app.inventory.slotAreas[0] = new PIXI.Container();
    app.inventory.slotAreas[0].interactive = true;
    app.inventory.slotAreas[0].addChild(genBoxSprite(64, 64, 2, 0x000000, 0xFFFFFF));

    app.inventory.slotAreas[1] = new PIXI.Container();
    app.inventory.slotAreas[1].addChild(genBoxSprite(64, 64, 2, 0x000000, 0xFFFFFF));
    app.inventory.slotAreas[1].interactive = true;

    app.inventory.slotAreas[0].slot = null;
    newWeapon();

    app.player.weapon = app.inventory.slotAreas[0].slot;

    app.money.curMoney = 10;

    app.inventory.slotAreas[1].slot = null;
    newArmour();

    app.player.armour = app.inventory.slotAreas[1].slot;

    app.inventory.inventoryArea.addChild(app.inventory.slotAreas[0]);
    app.inventory.slotAreas[0].position.set(135, 5);
    app.inventory.inventoryArea.addChild(app.inventory.slotAreas[1]);
    app.inventory.slotAreas[1].position.set(301, 5);

    app.inventory.slotAreas[0].mouseout = function (e) {
        app.mouse.showBox = false;

        app.mouse.curSlot = null;
    };

    app.inventory.slotAreas[0].mouseover = function (e) {
        console.log("over");
        e.stopPropagation();

        app.mouse.curSlot = this;

        if (this.slot === null) {
            app.mouse.showBox = false;
        } else {
            app.mouse.showBox = true;
            if (app.mouse.displayBox.children.length > 0) {
                app.mouse.displayBox.removeChildAt(0);
            }

            app.mouse.displayBox.addChildAt(genWeaponBox(this.slot), 0);
        }
    };


    app.inventory.slotAreas[1].mouseout = function (e) {
        app.mouse.showBox = false;

        app.mouse.curSlot = null;
    };

    app.inventory.slotAreas[1].mouseover = function (e) {
        console.log("over");
        e.stopPropagation();

        app.mouse.curSlot = this;

        if (this.slot === null) {
            app.mouse.showBox = false;
        } else {
            app.mouse.showBox = true;
            if (app.mouse.displayBox.children.length > 0) {
                app.mouse.displayBox.removeChildAt(0);
            }

            app.mouse.displayBox.addChildAt(genArmourBox(this.slot), 0);
        }
    };

    app.keys = new Keys();

    for (var y = 0; y < 10; y += 1) {
        for (var x = 0; x < 8; x += 1) {
            app.inventory.slotAreas[2 + x + (y * 8)] = new PIXI.Container();
            app.inventory.slotAreas[2 + x + (y * 8)].addChild(genBoxSprite(64, 64, 2, 0x000000, 0xFFFFFF));
            app.inventory.slotAreas[2 + x + (y * 8)].pos = 2 + x + (y * 8);
            app.inventory.slotAreas[2 + x + (y * 8)].interactive = true;

            app.inventory.slotAreas[2 + x + (y * 8)].slot = null;
            app.inventory.slotAreas[2 + x + (y * 8)].click = function (e) {
                e.stopPropagation();
                if (this.slot === null) {
                    console.log("null");
                } else if (this.slot.className == "Weapon") {
                    swapItems(this, app.inventory.slotAreas[0]);
                } else {
                    swapItems(this, app.inventory.slotAreas[1]);
                }
            };


            app.inventory.slotAreas[2 + x + (y * 8)].mouseout = function (e) {
                app.mouse.showBox = false;

                app.mouse.curSlot = null;
            };

            app.inventory.slotAreas[2 + x + (y * 8)].mouseover = function (e) {
                console.log("over");
                //e.stopPropagation();

                app.mouse.curSlot = this;

                if (this.slot === null) {
                    app.mouse.showBox = false;
                } else {
                    app.mouse.showBox = true;
                    if (app.mouse.displayBox.children.length > 0) {
                        app.mouse.displayBox.removeChildAt(0);
                    }

                    console.log(this.slot.className);

                    if (this.slot.className == "Weapon") {
                        app.mouse.displayBox.addChildAt(genWeaponBox(this.slot), 0);
                    } else {
                        app.mouse.displayBox.addChildAt(genArmourBox(this.slot), 0);
                    }
                    
                    if (app.keys.sell == true) {}
                }
            };

            app.inventory.inventoryArea.addChild(app.inventory.slotAreas[2 + x + (y * 8)]);
            app.inventory.slotAreas[2 + x + (y * 8)].position.set(x * 64 + 5, y * 64 + 80);
        }
    }

    app.ticker.add(function () {
        if (app.keys.pause === true) {
            return;
        }
        app.tick += 1;

        if (((app.tick % 30 == 0) || (app.wave.enemiesOnScreen == 0)) && (app.wave.enemiesInWave > 0) &&
            (app.wave.enemiesOnScreen < 30)) {
            var temp = moveInDirection(app.player.position, 200, toRadians(90 * Math.floor(Math.random() * 4) + 45));

            while (collidingWithWall(temp)) {
                var temp = moveInDirection(app.player.position, 200, toRadians(90 * Math.floor(Math.random() * 4) + 45));
            }
            var xToSpawn = temp.x,
                yToSpawn = temp.y;

            new Entity(new PIXI.Texture(app.playerImage), genRandomColour(),
                app.power * app.wave.enemyFactor, 2, 10, 1, xToSpawn, yToSpawn);
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

    resize();

    window.onresize = resize;
    
    console.log(getAngleInRadians(new PIXI.Point(0, 1), new PIXI.Point(0, 0)));

    app.ticker.add(updateUI);
    addEvents();
}

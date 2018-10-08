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

    app.id = 0;
    //Unique id assigned to each entity, increases each time one is created.

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
            app.inventory.inventoryArea.position.set(width - app.inventory.inventoryArea.width, 0);
        } else {
            app.inventory.inventoryArea.position.set(width, 0);
        }
        app.pauseText.position.set((app.renderer.width / 2) - (app.pauseText.width / 2), app.renderer.height / 2);
    }

    app = loadBulletImages(app);
    app = loadRarities(app);
    app.keys = new Keys();

    if ((storageAvailable('localStorage')) && (localStorage.getItem("PlayerCol"))) {
        document.getElementById("playerCol").value = localStorage.getItem("PlayerCol");
        //localStorage.clear();
    }

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
        curMoney: 10,
        highestMoneyGainRate: 0.1,
        moneyGainedIn5Sec: [],
        moneyGainedSec: 0
    };

    if ((storageAvailable('localStorage')) && (localStorage.getItem("money"))) {
        app.money.curMoney = Math.round(localStorage.getItem("money"));
        app.money.highestMoneyGainRate = Math.round(localStorage.getItem('moneyGain'));
    }

    app.transform = new PIXI.Point(0, 0);

    var wallImage = new PIXI.Graphics();
    wallImage.lineStyle(2, 0x000000);

    wallImage.drawRect(0, 0, app.renderer.width * 3, app.renderer.height * 3);

    app.wall = new PIXI.Sprite(app.renderer.generateTexture(wallImage));

    app.wall.position.set(-app.renderer.width, -app.renderer.height);

    app.players.addChild(app.wall);

    var style = {
        fontFamily: "Arial",
        fontSize: 36,
        fill: "black",
        wordWrap: false,
        wordWrapWidth: 200,
    };

    app.pauseText = new PIXI.Text("Game paused press P to unpause", style);

    app.ticker.add(function () {
        if (app.tick % 60 === 0) {
            app.money.curMoney += app.money.highestMoneyGainRate;
            if (app.keys.pause === false) {
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
        }
    });

    app.wave = {
        number: 0,
        enemiesInWave: 1,
        enemiesOnScreen: 0,
        enemyFactor: 1
    };

    app.power = 1;

    if ((storageAvailable('localStorage')) && (localStorage.getItem("wave"))) {
        if (localStorage.getItem('wave') > 0) {
            app.wave.number = Math.round(localStorage.getItem('wave'));
            app.power = Math.pow(1.28, app.wave.number);
            app.wave.enemyFactor = Math.pow(1.3, app.wave.number);
            app.wave.enemiesInWave = 10;
        }
    }

    app.settings = {
        format: "sci"
    };

    app.player = new Entity(new PIXI.Texture(app.playerImage), getPlayerColour(), app.power * 10, 3, 5, 0, app.renderer.width / 2, app.renderer.height / 2);

    app.inventory = {};
    app.inventory.backgroundImage = genBoxSprite(522, app.renderer.width, 2, 0x000000, 0xFFFFFF);
    app.inventory.clickTab = genBoxSprite(50, 100, 2, 0x000000, 0xFFFFFF);

    app.inventory.inventoryArea = new PIXI.Container();
    app.inventory.inventoryArea.addChild(app.inventory.backgroundImage);
    app.inventory.inventoryArea.addChild(app.inventory.clickTab);

    app.inventory.inventoryArea.enabled = false;
    app.inventory.inventoryArea.interactiveChildren = true;
    app.inventory.clickTab.interactive = true;
    app.inventory.clickTab.buttonMode = true;

    var style = {
        fontFamily: "Arial",
        fontSize: 36,
        fill: "black",
    };

    app.inventory.clickText = new PIXI.Text("Items", style);
    app.inventory.clickText.rotation = toRadians(90);
    app.inventory.inventoryArea.addChild(app.inventory.clickText);

    app.inventory.clickTab.click = function (e) {
        if (app.inventory.inventoryArea.enabled) {
            app.inventory.inventoryArea.position.x += app.inventory.inventoryArea.width;
            app.keys.pause = false;
            app.stage.removeChild(app.pauseText);
        } else {
            app.inventory.inventoryArea.position.x -= app.inventory.inventoryArea.width;
            app.keys.pause = true;
            app.stage.removeChild(app.pauseText);
        }
        app.inventory.inventoryArea.enabled = !app.inventory.inventoryArea.enabled;
    }
    app.inventory.clickTab.position.set(-50, (app.renderer.height / 2) - 50);
    app.inventory.clickText.position.set(0, (app.renderer.height / 2) - 45);

    app.stage.addChild(app.inventory.inventoryArea);

    app.stage.swapChildren(app.inventory.inventoryArea, app.mouse.displayBox);

    app.inventory.slotAreas = [];
    app.inventory.slot = [];

    app.inventory.slotAreas[0] = new PIXI.Container();
    app.inventory.slotAreas[0].interactive = true;
    app.inventory.slotAreas[0].buttonMode = true;
    app.inventory.slotAreas[0].addChild(genBoxSprite(64, 64, 2, 0x000000, 0xFFFFFF));

    app.inventory.slotAreas[1] = new PIXI.Container();
    app.inventory.slotAreas[1].addChild(genBoxSprite(64, 64, 2, 0x000000, 0xFFFFFF));
    app.inventory.slotAreas[1].interactive = true;
    app.inventory.slotAreas[1].buttonMode = true;

    app.inventory.slotAreas[0].slot = null;

    app.inventory.slotAreas[1].slot = null;

    app.inventory.inventoryArea.addChild(app.inventory.slotAreas[0]);
    app.inventory.slotAreas[0].position.set(135, 5);
    app.inventory.inventoryArea.addChild(app.inventory.slotAreas[1]);
    app.inventory.slotAreas[1].position.set(301, 5);

    app.inventory.slotAreas[0].mouseout = function (e) {
        app.mouse.showBox = false;

        app.mouse.curSlot = null;
    };

    app.inventory.slotAreas[0].mouseover = function (e) {
        //console.log("over");
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

    for (var y = 0; y < 5; y += 1) {
        for (var x = 0; x < 8; x += 1) {
            app.inventory.slotAreas[2 + x + (y * 8)] = new PIXI.Container();
            app.inventory.slotAreas[2 + x + (y * 8)].addChild(genBoxSprite(64, 64, 2, 0x000000, 0xFFFFFF));
            app.inventory.slotAreas[2 + x + (y * 8)].pos = 2 + x + (y * 8);
            app.inventory.slotAreas[2 + x + (y * 8)].interactive = true;
            app.inventory.slotAreas[2 + x + (y * 8)].buttonMode = true;

            app.inventory.slotAreas[2 + x + (y * 8)].slot = null;
            app.inventory.slotAreas[2 + x + (y * 8)].click = function (e) {
                e.stopPropagation();
                if (this.slot !== null && this.slot.className === "Weapon") {
                    swapItems(this, app.inventory.slotAreas[0]);
                } else if (this.slot !== null && this.slot.className === "Armour") {
                    swapItems(this, app.inventory.slotAreas[1]);
                }
            };


            app.inventory.slotAreas[2 + x + (y * 8)].mouseout = function (e) {
                app.mouse.showBox = false;

                app.mouse.curSlot = null;
            };

            app.inventory.slotAreas[2 + x + (y * 8)].mouseover = function (e) {
                //console.log("over");
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

    if ((storageAvailable('localStorage')) && (localStorage.getItem('inventoryItems'))) {
        var item = {};
        for (var i = 0; i < localStorage.getItem('inventoryItems'); i += 1) {
            if (localStorage.getItem('inventoryItem' + i)) {
                item = JSON.parse(localStorage.getItem('inventoryItem' + i));
                //console.log(item);
                if (item.className === "Weapon") {
                    loadWeapon(item, i);
                } else {
                    loadArmour(item, i);
                }
            }
        }
        app.player.weapon = app.inventory.slotAreas[0].slot;
        app.player.armour = app.inventory.slotAreas[1].slot;
    } else {
        newWeapon();
        app.player.weapon = app.inventory.slotAreas[0].slot;
        app.money.curMoney = 10;
        app.inventory.slotAreas[1].slot = null;
        newArmour();
        app.player.armour = app.inventory.slotAreas[1].slot;
    }
    
    

    app.ticker.add(function () {
        app.tick += 1;
        if (app.keys.pause === true) {
            return;
        }

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
        if ((app.wave.enemiesOnScreen <= 2 && app.wave.enemiesInWave <= 0 && app.wave.number > 0) ||
            (app.wave.enemiesOnScreen <= 0 && app.wave.number === 0)) {
            app.wave.enemiesInWave = 10;
            app.wave.number += 1;
            app.power *= 1.28;
            app.wave.enemyFactor *= 1.3;
        }

        if ((app.tick % 600 === 0) && (storageAvailable('localStorage'))) {
            var numItems = 0;
            for (var i = 0; i < app.inventory.slotAreas.length; i += 1) {
                if (app.inventory.slotAreas[i].slot != null) {
                    if (app.inventory.slotAreas[i].slot.className === "Weapon") {
                        localStorage.setItem('inventoryItem' + i, JSON.stringify(storeWeapon(app.inventory.slotAreas[i].slot)));
                    } else {
                        localStorage.setItem('inventoryItem' + i, JSON.stringify(storeArmour(app.inventory.slotAreas[i].slot)));
                    }
                    numItems += 1;
                }
            }
            localStorage.setItem('inventoryItems', numItems);
            localStorage.setItem('money', app.money.curMoney);
            localStorage.setItem('moneyGain', app.money.highestMoneyGainRate);
            localStorage.setItem('wave', app.wave.number);
        }
    });

    resize();

    window.onresize = resize;

    app.ticker.add(updateUI);
    addEvents();
}

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

        if (app.upgrades.upgradesArea.enabled) {
            app.upgrades.upgradesArea.position.set(width - app.upgrades.upgradesArea.width, 0);
        } else {
            app.upgrades.upgradesArea.position.set(width, 0);
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

    app.tick = 0;

    app.stage.interactive = true;

    app.mouse = new Mouse();
    app.enemies = [];
    app.money = {
        curMoney: new Decimal(10),
        highestMoneyGainRate: new Decimal(0.1),
        moneyGainedIn5Sec: [new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0), new Decimal(0)],
        moneyGainedSec: 0
    };

    if ((storageAvailable('localStorage')) && (localStorage.getItem("money"))) {
        if (localStorage.getItem("money")) {
            app.money.curMoney = new Decimal(localStorage.getItem("money"));
            app.money.highestMoneyGainRate = new Decimal(localStorage.getItem('moneyGain'));
        } else {
        }
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
            app.money.curMoney = app.money.curMoney.add(app.money.highestMoneyGainRate.mul(app.upgrades.slots[0].power));
            app.money.highestMoneyGainRate = app.money.highestMoneyGainRate.mul(app.upgrades.slots[4].power);
            if (app.keys.pause === false) {
                var average = new Decimal(0);
                for (var i = 0; i < 5; i += 1) {
                    average = average.add(app.money.moneyGainedIn5Sec[i]);
                }
                average = average.div(5);
                if (average.gt(app.money.highestMoneyGainRate)) {
                    app.money.highestMoneyGainRate = average;
                }

                app.money.moneyGainedSec += 1;
                if (app.money.moneyGainedSec >= 6) {
                    app.money.moneyGainedSec = 0;
                }

                app.money.moneyGainedIn5Sec[app.money.moneyGainedSec].mul(0);
            }
        }
    });

    app.wave = {
        number: new Decimal(0),
        enemiesInWave: 1,
        enemiesOnScreen: 0,
        enemyFactor: new Decimal(0.1),
        factorStartPow: 1.65,
        factorIncrease: 0.15
    };

    app.power = new Decimal(1);

    if ((storageAvailable('localStorage')) && (localStorage.getItem("wave"))) {
        if (localStorage.getItem('wave') > 0) {
            app.wave.number = new Decimal(localStorage.getItem('wave'));
            app.power = new Decimal(Math.pow(1.4, app.wave.number));
            app.wave.enemyFactor = getEnPow(app.wave.number);
            app.wave.enemiesInWave = 10;
        }
    }

    app.settings = {
        format: "sci"
    };
    
    app.unlocks = {
        upgrades: 0,
        maxRarity: 0,
        inventoryUnlocked: false,
        upgradesUnlocked: false,
        arenaName: "Unranked (Next rank at wave 12)."
    };
    
    if ((storageAvailable('localStorage')) && (localStorage.getItem('unlocks'))) {
        app.unlocks = JSON.parse(localStorage.getItem('unlocks'));
    }

    app.upgrades = {};
    app.upgrades.backgroundImage = genBoxSprite(522, app.renderer.height, 2, 0x000000, 0xFFFFFF);
    app.upgrades.clickTab = genBoxSprite(50, 180, 2, 0x000000, 0xFFFFFF);

    app.upgrades.upgradesArea = new PIXI.Container();
    app.upgrades.upgradesArea.addChild(app.upgrades.backgroundImage);
    app.upgrades.upgradesArea.addChild(app.upgrades.clickTab);

    app.upgrades.upgradesArea.enabled = false;
    app.upgrades.upgradesArea.interactiveChildren = true;
    app.upgrades.upgradesArea.enabled = false;
    app.upgrades.upgradesArea.visible = app.unlocks.upgradesUnlocked;
    app.upgrades.clickTab.interactive = app.unlocks.upgradesUnlocked;
    app.upgrades.clickTab.buttonMode = true;

    var style = {
        fontFamily: "Arial",
        fontSize: 28,
        fill: "black",
    };

    app.upgrades.clickText = new PIXI.Text("Upgrades (U)", style);
    app.upgrades.clickText.rotation = toRadians(90);
    app.upgrades.upgradesArea.addChild(app.upgrades.clickText);

    app.upgrades.clickTab.click = function (e) {
        if (app.upgrades.upgradesArea.enabled) {
            app.upgrades.upgradesArea.position.x += app.upgrades.upgradesArea.width;
            app.keys.pause = false;
            app.stage.removeChild(app.pauseText);
        } else {
            app.upgrades.upgradesArea.position.x -= app.upgrades.upgradesArea.width;
            app.keys.pause = true;
            app.stage.removeChild(app.pauseText);
            app.inventory.inventoryArea.close();
        }
        app.upgrades.upgradesArea.enabled = !app.upgrades.upgradesArea.enabled;
    }

    app.upgrades.upgradesArea.close = function () {
        if (app.upgrades.upgradesArea.enabled) {
            app.upgrades.upgradesArea.position.x += app.upgrades.upgradesArea.width;
            //app.keys.pause = false;
            app.stage.removeChild(app.pauseText);
            app.upgrades.upgradesArea.enabled = false;
        }
    }

    app.upgrades.clickTab.position.set(-50, (app.renderer.height / 2) - 150);
    app.upgrades.clickText.position.set(0, (app.renderer.height / 2) - 145);

    app.stage.addChild(app.upgrades.upgradesArea);

    app.stage.swapChildren(app.upgrades.upgradesArea, app.mouse.displayBox);

    app.upgrades.slots = [];

    app.upgrades.slots = [
        new UpgradeArea("Increases money gained by val1% \n cost: val2 level: val3", 5, 5, new Decimal(1000), new Decimal(1.6), new Decimal(1), new Decimal(1.2), 0, true, 0),
        new UpgradeArea("Increases damage done by val1% \n cost: val2 level: val3", 262, 5, new Decimal(100), new Decimal(1.6), new Decimal(1), new Decimal(1.2), 0, true, 1),
        new UpgradeArea("Increases maximum hp by val1% \n cost: val2 level: val3", 5, 110, new Decimal(100), new Decimal(1.6), new Decimal(1), new Decimal(1.2), 0, true, 2),
        new UpgradeArea("Increases rate of fire by +val1 levels \n cost: val2 level: val3", 262, 110, new Decimal("1e15"), new Decimal("1e5"), new Decimal(1), new Decimal(1), 0, false, 3), 
        new UpgradeArea("Increases interest gained per minute to xval1 \n cost: val2 level: val3", 5, 215, new Decimal("1e20"), new Decimal("1e20"), new Decimal(1), new Decimal(0.1), 0, false, 4)];

    if ((storageAvailable('localStorage')) && (localStorage.getItem('upgradeItems'))) {
        var upgradeItem = {};
        for (var i = 0; i < localStorage.getItem('upgradeItems'); i += 1) {
            upgradeItem = JSON.parse(localStorage.getItem('upgrade' + i));
            app.upgrades.slots[i].setLevel(upgradeItem.startingLevel);
        }
    }

    var style = {
        fontFamily: "Arial",
        fontSize: 12,
        fill: "black",
        wordWrap: false,
        wordWrapWidth: 200,
    };

    app.upgrades.buyButton = genBoxSprite(96, 46, 2, 0x000000, 0xFFFFFF);
    app.upgrades.upgradesArea.addChild(app.upgrades.buyButton);
    app.upgrades.buyButton.position.set(5, 490);
    app.upgrades.buyButton.interactive = true;
    app.upgrades.buyButton.buttonMode = true;
    app.upgrades.buyButton.text = new PIXI.Text("Buy one", style);
    app.upgrades.upgradesArea.addChild(app.upgrades.buyButton.text);
    app.upgrades.buyButton.text.position.set(35, 500);
    app.upgrades.buyButton.buyType = "single";
    app.upgrades.buyButton.click = function (e) {
        if (this.buyType === "single") {
            this.buyType = "max";
            this.text.text = "Buy Max";
        } else {
            this.buyType = "single";
            this.text.text = "Buy One";
        }
    }
    
    app.upgrades.settingsButton = genBoxSprite(96, 46, 2, 0x000000, 0xFFFFFF);
    app.upgrades.upgradesArea.addChild(app.upgrades.settingsButton);
    app.upgrades.settingsButton.position.set(105, 490);
    app.upgrades.settingsButton.interactive = true;
    app.upgrades.settingsButton.buttonMode = true;
    app.upgrades.settingsButton.text = new PIXI.Text("Normal", style);
    app.upgrades.upgradesArea.addChild(app.upgrades.settingsButton.text);
    app.upgrades.settingsButton.text.position.set(125, 500);
    app.upgrades.settingsButton.click = function (e) {
        if (app.settings.format === "sci") {
            app.settings.format = "eng";
            this.text.text = "Engineering";
        } else if (app.settings.format === "eng") {
            app.settings.format = "norm";
            this.text.text = "Normal";
        } else if (app.settings.format === "norm") {
            app.settings.format = "sci";
            this.text.text = "Scientific";
        }
        for (var i = 0; i < app.upgrades.slots.length; i += 1) {
            app.upgrades.slots[i].updateText();
        }
    }

    app.player = new Entity(new PIXI.Texture(app.playerImage), getPlayerColour(), app.power.mul(10), 3, 5, 0, app.renderer.width / 2, app.renderer.height / 2);

    app.inventory = {};
    app.inventory.backgroundImage = genBoxSprite(522, app.renderer.width, 2, 0x000000, 0xFFFFFF);
    app.inventory.clickTab = genBoxSprite(50, 140, 2, 0x000000, 0xFFFFFF);

    app.inventory.inventoryArea = new PIXI.Container();
    app.inventory.inventoryArea.addChild(app.inventory.backgroundImage);
    app.inventory.inventoryArea.addChild(app.inventory.clickTab);

    app.inventory.inventoryArea.enabled = false;
    app.inventory.inventoryArea.interactiveChildren = true;
    app.inventory.inventoryArea.interactive = true;
    app.inventory.inventoryArea.visible = app.unlocks.inventoryUnlocked;
    app.inventory.clickTab.interactive = app.unlocks.inventoryUnlocked;
    app.inventory.clickTab.buttonMode = true;

    var style = {
        fontFamily: "Arial",
        fontSize: 36,
        fill: "black",
    };

    app.inventory.clickText = new PIXI.Text("Items (I)", style);
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
            app.upgrades.upgradesArea.close();
        }
        app.inventory.inventoryArea.enabled = !app.inventory.inventoryArea.enabled;
    }

    app.inventory.inventoryArea.close = function () {
        if (app.inventory.inventoryArea.enabled) {
            app.inventory.inventoryArea.position.x += app.inventory.inventoryArea.width;
            //app.keys.pause = false;
            app.stage.removeChild(app.pauseText);
            app.inventory.inventoryArea.enabled = false;
        }
    }

    app.inventory.clickTab.position.set(-50, (app.renderer.height / 2) + 40);
    app.inventory.clickText.position.set(0, (app.renderer.height / 2) + 45);

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

    app.inventory.inventoryArea.mouseout = function (e) {
        app.mouse.showBox = false;

        app.mouse.curSlot = null;
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
                if (app.mouse.curSlot === this.pos) {
                    app.mouse.showBox = false;

                    app.mouse.curSlot = null;
                }

            };

            app.inventory.slotAreas[2 + x + (y * 8)].mouseover = function (e) {

                app.mouse.curSlot = this.pos;

                if (this.slot === null) {
                    app.mouse.showBox = false;
                } else {
                    app.mouse.showBox = true;
                    if (app.mouse.displayBox.children.length > 0) {
                        app.mouse.displayBox.removeChildAt(0);
                    }

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
        newWeapon(3);
        app.player.weapon = app.inventory.slotAreas[0].slot;
        app.money.curMoney = new Decimal(10);
        app.inventory.slotAreas[1].slot = null;
        newArmour();
        app.player.armour = app.inventory.slotAreas[1].slot;
    }

    app.ticker.add(function () {
        app.tick += 1;
        if (app.keys.pause === true) {
            return;
        }

        if (((app.tick % 30 == 0) || (app.wave.enemiesOnScreen <= 1)) && (app.wave.enemiesInWave > 0) &&
            (app.wave.enemiesOnScreen < 30)) {
            var temp = moveInDirection(app.player.position, 200, toRadians(360 * Math.random()) + 45);

            while (collidingWithWall(temp)) {
                var temp = moveInDirection(app.player.position, 200, toRadians(360 * Math.random()) + 45);
            }
            var xToSpawn = temp.x,
                yToSpawn = temp.y;

            new Entity(new PIXI.Texture(app.playerImage), genRandomColour(),
                app.wave.enemyFactor, 2, 10, 1, xToSpawn, yToSpawn);
            app.wave.enemiesInWave -= 1;
            app.wave.enemiesOnScreen += 1;
        }
        if ((app.wave.enemiesOnScreen <= 2 && app.wave.enemiesInWave <= 0 && app.wave.number.gt(0)) ||
            (app.wave.enemiesOnScreen <= 0 && app.wave.number.eq(0))) {
            app.wave.enemiesInWave = 10;
            app.wave.number = app.wave.number.add(1);
            checkUnlocks(app.wave.number);
            app.power = app.power.mul(1.4);
            app.wave.enemyFactor = app.wave.enemyFactor.mul(app.wave.factorStartPow + (Math.round(app.wave.number / 1000) * app.wave.factorIncrease));
        }

        if ((app.tick % 600 === 0) && (storageAvailable('localStorage'))) {
            console.log("saved");
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
            numItems = 0;
            for (var i = 0; i < app.upgrades.slots.length; i += 1) {
                if (app.upgrades.slots[i] != null) {
                    localStorage.setItem('upgrade' + i, JSON.stringify(storeUpgrade(app.upgrades.slots[i])));
                }
                numItems += 1;
            }
            localStorage.setItem('upgradeItems', numItems);
            localStorage.setItem('money', app.money.curMoney.toString());
            localStorage.setItem('moneyGain', app.money.highestMoneyGainRate.toString());
            localStorage.setItem('wave', app.wave.number);
            localStorage.setItem('unlocks', JSON.stringify(app.unlocks));
        }
    });

    resize();

    window.onresize = resize;

    app.ticker.add(updateUI);
    addEvents();
    
    app.ticker.speed = 1;

    app.ticker.start();
}

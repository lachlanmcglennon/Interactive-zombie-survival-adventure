var sniperImage = new PIXI.Graphics();
sniperImage.beginFill(0xFFFFFF, 1);

sniperImage.drawCircle(0, 0, 4);

var laserImage = new PIXI.Graphics();
laserImage.beginFill(0xFFFFFF, 1);

laserImage.drawRect(0, 0, 25, 4);

var destroyerImage = new PIXI.Graphics();
destroyerImage.beginFill(0xFFFFFF, 1);

destroyerImage.drawCircle(0, 0, 10);

var weaponTypes = [
        {
            name : "Sniper",
            speed : 5,
            useTime : 30,
            damageMod : 5,
            lifetime : 120,
            image : sniperImage,
            ai : SniperAi
        },
        {
            name : "Laser",
            speed : 6,
            useTime : 5,
            damageMod : 5 / 6,
            lifetime : 30,
            image : laserImage,
            ai : CloseAi
        },
        {
            name : "Destroyer",
            speed : 2,
            useTime : 60,
            damageMod : 10,
            lifetime : 240,
            image : destroyerImage,
            ai : SniperAi
        },
        {
            name : "MachineGun",
            speed : 4,
            useTime : 10,
            damageMod : 5 / 3,
            lifetime : 60,
            image : sniperImage,
            ai : CloseAi
        }
    ];
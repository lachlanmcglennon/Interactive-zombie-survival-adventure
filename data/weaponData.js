var bulletImage = new PIXI.Graphics();
bulletImage.lineStyle(2, 0xFFFFFF, 1);

//bulletImage.beginFill(0x00FF22, 0.5);
bulletImage.drawCircle(0, 0, 4);
//bulletImage.endFill();

var weaponTypes = [
        {
            name : "Sniper",
            speed : 5,
            useTime : 30,
            damageMod : 5,
            image : bulletImage,
            ai : SniperAi
        },
        {
            name : "MachineGun",
            speed : 3,
            useTime : 10,
            damageMod : 2,
            image : bulletImage,
            ai : SniperAi
        }
    ];
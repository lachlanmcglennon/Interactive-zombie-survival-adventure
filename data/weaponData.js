function loadBulletImages(app) {

    app.bulletImages = [];

    var sniperImage = new PIXI.Graphics();
    sniperImage.beginFill(0xFFFFFF, 1);
    sniperImage.drawCircle(0, 0, 4);

    app.bulletImages.push(app.renderer.generateTexture(sniperImage));

    var laserImage = new PIXI.Graphics();
    laserImage.beginFill(0xFFFFFF, 1);
    laserImage.drawRect(0, 0, 25, 4);

    app.bulletImages.push(app.renderer.generateTexture(laserImage));

    var destroyerImage = new PIXI.Graphics();
    destroyerImage.beginFill(0xFFFFFF, 1);
    destroyerImage.drawCircle(0, 0, 10);
    destroyerImage.endFill();

    app.bulletImages.push(app.renderer.generateTexture(destroyerImage));

    app.weaponTypes = [
        {
            name: "Sniper",
            speed: 5,
            useTime: 30,
            damageMod: 5,
            lifetime: 120,
            image: 0,
            collisionType: "circle",
            size: 4,
            ai: SniperAi
        },
        {
            name: "Laser",
            speed: 6,
            useTime: 5,
            damageMod: 5 / 6,
            lifetime: 30,
            image: 1,
            collisionType: "circle",
            size: 6,
            ai: CloseAi
        },
        {
            name: "Destroyer",
            speed: 3,
            useTime: 60,
            damageMod: 10,
            lifetime: 240,
            image: 2,
            collisionType: "circle",
            size: 10,
            ai: SniperAi
        },
        {
            name: "Machine Gun",
            speed: 4,
            useTime: 10,
            damageMod: 5 / 3,
            lifetime: 60,
            image: 0,
            collisionType: "circle",
            size: 4,
            ai: CloseAi
        }
    ];

    return app;
}

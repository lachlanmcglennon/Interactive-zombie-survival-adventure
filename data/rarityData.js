function loadRarities(app) {
    app.rarities = [
        new Rarity("Standard", 0x222222, 1, 0),
        new Rarity("Specialized", 0x3879F0, 1.2, 1),
        new Rarity("Elite", 0x8E42B9, 1.5, 2),
        new Rarity("Perfect", 0xC07924, 2, 2)
    ];
    return app;
}

function Rarity(name, colour, statMod, effectSlots) {
    this.name = name;
    this.colour = colour;
    this.statMod = statMod;
    this.effectSlots = effectSlots;
}

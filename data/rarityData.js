function loadRarities(app) {
    app.rarities = [
        new Rarity(0, "Standard", 0x222222, 1, 0),
        new Rarity(1, "Specialized", 0x3879F0, 2, 1),
        new Rarity(2, "Elite", 0x8E42B9, 5, 2),
        new Rarity(3, "Perfect", 0xC07924, 10, 2)
    ];
    return app;
}

function Rarity(id, name, colour, statMod, effectSlots) {
    this.id = id;
    this.name = name;
    this.colour = colour;
    this.statMod = statMod;
    this.effectSlots = effectSlots;
}

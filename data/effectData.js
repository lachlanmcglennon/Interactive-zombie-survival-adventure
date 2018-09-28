var effectTypes = [{
    name: "Homing",
    moveFunction: function (bullet) {
        var target = bullet.weapon.entity.weaponTarget,
            closestDistance = 1000000000000000;
        if (bullet.weapon.entity.team === 0) {
            for (var i = 2; i < app.players.children.length; i += 1) {
                if ((getDistanceFrom(bullet.position, app.players.getChildAt(i).position) < closestDistance)) {
                    closestDistance = getDistanceFrom(bullet.position, app.players.getChildAt(i).position);
                    target = app.players.getChildAt(i).position;
                }
            }
        } else if (bullet.weapon.entity.team === 1) {
            target = app.player.position;
        }



        var maxRotation = toRadians(5);

        var angleToRotate = getAngleInRadians(bullet.position, target);

        if (Math.abs(angleToRotate - bullet.direction) > maxRotation) {
            if (bullet.direction - toRadians(180) > angleToRotate) {
                bullet.direction -= maxRotation;
            } else {
                bullet.direction += maxRotation;
            }
        } else {
            bullet.direction = angleToRotate;
        }
        bullet.rotation = bullet.direction;

        //bullet.position.copy(moveToPoint(bullet.weapon.entity.position, target, 10));

        bullet.accel = setAccelInDirection(bullet.direction, bullet.speed);
        return;
    },
    onHitFunction: null
}, {
    name: "Critical",
    moveFunction: null,
    onHitFunction: function (bullet) {
        var power = bullet.weapon.group.power,
            critRate = Math.abs(Math.log10(power) * 5) / 100,
            critMult = Math.log2(power),
            randomSeed = Math.random();
        if (critRate > 1) {
            critRate = 1;
        }
        
        if (randomSeed < critRate) {
            bullet.critMult = critMult;
        }
        
        return;
    }
}];

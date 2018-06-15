//This file is for creating event listeners.

function addEvents() {
document.addEventListener('keydown', 
    function (event) {
        if (event.key == "d") {
            app.keys.d = true;
        }
    
        if (event.key == "a") {
            app.keys.a = true;
        }
        if (event.key == "w") {
            app.keys.w = true;
        }
        if (event.key == "s") {
            app.keys.s = true;
        }
    
        if (event.key == "ArrowRight") {
            app.keys.d = true;
        }
    
        if (event.key == "ArrowLeft") {
            app.keys.a = true;
        }
        if (event.key == "ArrowUp") {
            app.keys.w = true;
        }
        if (event.key == "ArrowDown") {
            app.keys.s = true;
        }
    
        if (event.key == "e") {
            if (app.keys.autofire == false) {
                app.keys.autofire = true;
            } else {
                app.keys.autofire = false;
            }
        }
    
        if (event.key == "p") {
            if (app.keys.pause == false) {
                app.keys.pause = true;
                app.ticker.stop();
            } else {
                app.keys.pause = false;
                app.ticker.start();
            }
        }
        
        if (event.key == "n") {
            newWeapon();
        }
        if (event.key == "m") {
            newArmour();
        }
    });

document.addEventListener('keyup', 
    function (event) {
        if (event.key == "d") {
            app.keys.d = false;
        }
    
        if (event.key == "a") {
            app.keys.a = false;
        }
        if (event.key == "w") {
            app.keys.w = false;
        }
        if (event.key == "s") {
            app.keys.s = false;
        }
    
        if (event.key == "ArrowRight") {
            app.keys.d = false;
        }
    
        if (event.key == "ArrowLeft") {
            app.keys.a = false;
        }
        if (event.key == "ArrowUp") {
            app.keys.w = false;
        }
        if (event.key == "ArrowDown") {
            app.keys.s = false;
        }
    });

playerCol.addEventListener("change", function (event) {
    app.player.colour = getPlayerColour();
    app.player.tint = app.player.colour;
}, false);

document.addEventListener('mousedown', 
    function (event) {
        app.keys.mouseLeft = true;
    });

document.addEventListener('mouseup', 
    function (event) {
        app.keys.mouseLeft = false;
    });
    
}
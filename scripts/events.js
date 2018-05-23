//This file is for creating event listeners.

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
    
        if (event.key == "e") {
            if (app.keys.autofire == false) {
                app.keys.autofire = true;
            } else {
                app.keys.autofire = false;
            }
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
    });

document.addEventListener('mousedown', 
    function (event) {
        app.keys.mouseLeft = true;
    });

document.addEventListener('mouseup', 
    function (event) {
        app.keys.mouseLeft = false;
    });
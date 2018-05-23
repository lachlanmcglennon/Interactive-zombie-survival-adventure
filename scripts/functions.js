//This file contains general purpose functions used throughout the code.

function getAngleInRadians(p1, p2) {
    //Gets the angle between 2 PIXI.Point values, and returns it, in radians.
    return Math.atan2(p2.y - p1.y, p2.x - p1.x)
}

function setAccelToPoint(source, target, accel, speed) {
    accel.x = speed * Math.cos(getAngleInRadians(source, target));
    accel.y = speed * Math.sin(getAngleInRadians(source, target));
}

function setAccelInDirection(accel, direction, speed) {
    accel.x = speed * Math.cos(direction);
    accel.y = speed * Math.sin(direction);
}

function toRadians(degrees) {
    return (degrees * Math.PI)/180;
}
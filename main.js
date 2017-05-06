var WIDTH = 1536;
var HEIGHT = 734;

window.requestAnimFrame = function(){
    return (
        window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(/* function */ callback){
            window.setTimeout(callback, 1000 / 60);
        }
    );
}();

/*
 * Code by Mickey Shine at http://stackoverflow.com/users/115781/mickey-shine
 */
// --------------------------------------------------------------------------
function touchHandler(event)
{
    var touches = event.changedTouches,
        first = touches[0],
        type = "";
    switch(event.type)
    {
        case "touchstart": type = "mousedown"; break;
        case "touchmove":  type = "mousemove"; break;
        case "touchend":   type = "mouseup";   break;
        default:           return;
    }

    // initMouseEvent(type, canBubble, cancelable, view, clickCount,
    //                screenX, screenY, clientX, clientY, ctrlKey,
    //                altKey, shiftKey, metaKey, button, relatedTarget);

    var simulatedEvent = document.createEvent("MouseEvent");
    simulatedEvent.initMouseEvent(type, true, true, window, 1,
        first.screenX, first.screenY,
        first.clientX, first.clientY, false,
        false, false, false, 0/*left*/, null);


    first.target.dispatchEvent(simulatedEvent);
    //event.preventDefault();
}
document.addEventListener("touchstart", touchHandler, true);
document.addEventListener("touchmove", touchHandler, true);
document.addEventListener("touchend", touchHandler, true);
document.addEventListener("touchcancel", touchHandler, true);
// --------------------------------------------------------------------------

var canvas = document.getElementById("main_canvas");
document.body.style.backgroundColor = "#000";
var ctx = canvas.getContext("2d");

var unloadedElements = 0;

window.onload = window.onresize = function(event)
{
    //canvas.width = Math.max(document.body.clientWidth, (HEIGHT + 290) * document.body.clientHeight/HEIGHT);
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;

    WIDTH = HEIGHT * canvas.width/canvas.height;

    ctx.scale(canvas.height/HEIGHT, canvas.height/HEIGHT);
};

var x = 0;
var y = 0;
var mouseDown = false;

canvas.addEventListener("mousemove", function (e) {
    var rect = canvas.getBoundingClientRect();
    var scaleX = canvas.width / rect.width;
    var scaleY = canvas.height / rect.height;

    x = (e.clientX - rect.left) * scaleX * HEIGHT/canvas.height;
    y = (e.clientY - rect.top) * scaleY * HEIGHT/canvas.height;
},false);
canvas.addEventListener("mousedown", function (e) {
    var rect = canvas.getBoundingClientRect();
    var scaleX = canvas.width / rect.width;
    var scaleY = canvas.height / rect.height;

    x = (e.clientX - rect.left) * scaleX * HEIGHT/canvas.height;
    y = (e.clientY - rect.top) * scaleY * HEIGHT/canvas.height;
    mouseDown = true;
},false);
canvas.addEventListener("mouseup", function (e) {
    var rect = canvas.getBoundingClientRect();
    var scaleX = canvas.width / rect.width;
    var scaleY = canvas.height / rect.height;

    x = (e.clientX - rect.left) * scaleX * HEIGHT/canvas.height;
    y = (e.clientY - rect.top) * scaleY * HEIGHT/canvas.height;
    mouseDown = false;
},false);

function colorToText(color)
{
    return "rgba(" + color.r + "," + color.g + "," + color.b + "," + color.a + ")";
}

var Sprite = {
    width: 10,
    height: 10,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    accel: 5,
    friction: .85,
    init: function() {},
    physics: function() {
        this.vx *= this.friction;
        this.vy *= this.friction;

        this.x += this.vx;
        this.y += this.vy;
    },
    draw: function(ctx) {}
};

var Circle = Object.create(Sprite);
Circle.radius = 10;
Circle.draw = function(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, 2*Math.PI);
    ctx.fill();
    ctx.restore();
};

var GlowingCircle = Object.create(Circle);
GlowingCircle.color = {r: 255, g: 200, b: 50, a: 1};
GlowingCircle.glowRadiusAdd = 30;
GlowingCircle.disappear = false;
GlowingCircle.lifeSpan = 100;
GlowingCircle.init = function() {
    this.grd = ctx.createRadialGradient(0,0,this.radius/4,0,0, this.radius + this.glowRadiusAdd);
    this.grd.addColorStop(0, "#FFF");
    //this.grd.addColorStop(this.radius/(this.radius + this.glowRadiusAdd), colorToText(this.color));
    var fadeColor = Object.create(this.color);
    fadeColor.a = .2;
    this.grd.addColorStop(this.radius/(this.radius + this.glowRadiusAdd), colorToText(fadeColor));
    fadeColor.a = 0;
    this.grd.addColorStop(1, colorToText(fadeColor));
    this.lifeLeft = this.lifeSpan;
};
GlowingCircle.draw = function(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.fillStyle = this.grd;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius + this.glowRadiusAdd, 0, 2*Math.PI);
    ctx.fill();
    ctx.restore();
};

var sprites = [];

var glowingCircles  = [];
var testGlowingCircle = Object.create(GlowingCircle);
testGlowingCircle.x = 100;
testGlowingCircle.y = 100;
testGlowingCircle.radius = 50;
glowingCircles.push(testGlowingCircle);

sprites = sprites.concat(glowingCircles);


sprites.forEach(function(sprite,index) {
    sprite.init();
});

update();

function update() {
    window.requestAnimFrame(update);

    ctx.fillStyle = "#000";
    ctx.fillRect(0,0,WIDTH,HEIGHT);

    if (mouseDown)
    {
        var newGlowingCircle = Object.create(GlowingCircle);
        newGlowingCircle.disappear = true;
        newGlowingCircle.radius = 10;
        newGlowingCircle.friction = 1.01;
        var angle = Math.random() * Math.PI * 2;
        newGlowingCircle.vx = Math.cos(angle) * 10 + testGlowingCircle.vx;
        newGlowingCircle.vy = Math.sin(angle) * 10 + testGlowingCircle.vy;
        newGlowingCircle.x = testGlowingCircle.x + (newGlowingCircle.radius + testGlowingCircle.radius) * Math.cos(angle) - newGlowingCircle.vx;
        newGlowingCircle.y = testGlowingCircle.y + (newGlowingCircle.radius + testGlowingCircle.radius) * Math.sin(angle) - newGlowingCircle.vy;
        newGlowingCircle.init();
        glowingCircles.push(newGlowingCircle);
        sprites.push(newGlowingCircle);
    }
    if (true) {
        var dx = x - testGlowingCircle.x;
        var dy = y - testGlowingCircle.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > testGlowingCircle.radius/2) {
            testGlowingCircle.vx += testGlowingCircle.accel * dx / dist;
            testGlowingCircle.vy += testGlowingCircle.accel * dy / dist;
        }
    }

    sprites.forEach(function(sprite,index) {
        sprite.physics();
    });

    sprites.forEach(function(sprite,index) {
        sprite.draw(ctx);
    });
}
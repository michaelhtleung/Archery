/*
    Features to Implement:
    - ground and sky (with clouds) background to make it pretty
    - bow sprite animation for when you have different power levels
    - arrow angling changes at different points in flight
    - arrows getting stuck in the moving target/ground
*/

// graphics

// arrow
const ARROW_DIMENSIONS = 128;
const ARROW_RESIZE_FACTOR = 1;
var arrow = new Image(ARROW_DIMENSIONS/ARROW_RESIZE_FACTOR,
                                ARROW_DIMENSIONS/ARROW_RESIZE_FACTOR);
arrow.src = "img/horizontal_arrow.png"; 

// target crosshairs
const TARGET_DIMENSIONS = 42;
const TARGET_RESIZE_FACTOR = 1;
var target = new Image(TARGET_DIMENSIONS/TARGET_RESIZE_FACTOR,
                                TARGET_DIMENSIONS/TARGET_RESIZE_FACTOR);
target.src = "img/crosshair_red_small.png"; 

// board
const BOARD_DIMENSIONS = 142;
const BOARD_RESIZE_FACTOR = 1;
var board = new Image(BOARD_DIMENSIONS/BOARD_RESIZE_FACTOR,
                                BOARD_DIMENSIONS/BOARD_RESIZE_FACTOR);
board.src = "img/target_colored_outline.png";   

// sky
const SKY_DIMENSIONS = 512;
const SKY_RESIZE_FACTOR = 1.5;
var sky_background = new Image(SKY_DIMENSIONS/SKY_RESIZE_FACTOR,
                                SKY_DIMENSIONS/SKY_RESIZE_FACTOR);
sky_background.src = "img/skybox_sideHills.png";

// sky top
var sky_top = new Image(SKY_DIMENSIONS/SKY_RESIZE_FACTOR,
                                SKY_DIMENSIONS/SKY_RESIZE_FACTOR);
sky_top.src = "img/skybox_top.png";

// grass
const GRASS_DIMENSIONS = 128;
const GRASS_RESIZE_FACTOR = 2; // 1.8 or 2
var grass = new Image(GRASS_DIMENSIONS/GRASS_RESIZE_FACTOR,
                        GRASS_DIMENSIONS/GRASS_RESIZE_FACTOR);
grass.src = "img/stone_grass.png";

// grass blades
var grass_blades = [new Image(GRASS_DIMENSIONS/GRASS_RESIZE_FACTOR,
                        GRASS_DIMENSIONS/GRASS_RESIZE_FACTOR),
                    new Image(GRASS_DIMENSIONS/GRASS_RESIZE_FACTOR,
                        GRASS_DIMENSIONS/GRASS_RESIZE_FACTOR),
                    new Image(GRASS_DIMENSIONS/GRASS_RESIZE_FACTOR,
                        GRASS_DIMENSIONS/GRASS_RESIZE_FACTOR),
                    new Image(GRASS_DIMENSIONS/GRASS_RESIZE_FACTOR,
                        GRASS_DIMENSIONS/GRASS_RESIZE_FACTOR)];
for (var i = 1; i <= grass_blades.length; i++){
    grass_blades[i-1].src = "img/grass" + i + ".png";
}

// gold
var gold = new Image(GRASS_DIMENSIONS/GRASS_RESIZE_FACTOR,
                        GRASS_DIMENSIONS/GRASS_RESIZE_FACTOR);
gold.src = "img/stone_gold.png";
    
// stone
var stone = new Image(GRASS_DIMENSIONS/GRASS_RESIZE_FACTOR,
                        GRASS_DIMENSIONS/GRASS_RESIZE_FACTOR);
stone.src = "img/stone.png";

// bow
const TOTAL_BOW_WIDTH = 420;
const TOTAL_BOW_HEIGHT = 360;
const BOW_WIDTH = TOTAL_BOW_WIDTH/6;
const BOW_HEIGHT = TOTAL_BOW_HEIGHT/4;
const BOW_RESIZE_FACTOR = 2.2;
var bow = new Image(TOTAL_BOW_WIDTH, TOTAL_BOW_HEIGHT);
bow.src = "img/bow.png";

// game settings
const FPS = 60;
const GRAVITY = 1;

var canvas;
var canvasContext;

var showBall = false;
var showTarget = false;
var showPath = false;
var showBow = true;

var actionCycle = [true, false, false]; // [placingBow, placingTarget, watchingBall]
var groundHeight;

var ballVelocity = [0, 0];
var ballLocation = [50,50];
var ballHeight = 5;
var ballWidth = 40;

var bowLocation = [0, 0];

var boardLocation = [];
var boardSpeed = [0, 1];
var boardHeight = board.height; // testing : 100
var boardWidth = 10; // testing : 10
var boardBuffer = 5;
<!-- const BOARD_HEIGHT; -->
<!-- const BOARD_WIDTH; -->
<!-- var board = new Image(GRASS_DIMENSIONS/GRASS_RESIZE_FACTOR, -->
                        <!-- GRASS_DIMENSIONS/GRASS_RESIZE_FACTOR); -->
<!-- grass.src = "img/stone_grass.png"; -->

var targetLocation = [0,0];
var maxPower;
var power = [];

<!-- var firstRender = true; -->
<!-- var x = 0; // index for emptpy rng grass array -->


function calculateMousePos(evt){
    // accounts for scrolling and moving the mouse outside the canvas
    var rect = canvas.getBoundingClientRect();
    var root = document.documentElement;
    var mouseX = evt.clientX - rect.left - root.scrollLeft;
    var mouseY = evt.clientY - rect.top - root.scrollTop;
    // seems like returning a dictionary in python
    return { 
        x:mouseX,
        y:mouseY
    };
}

function fire(x, y){
    console.log("Fire!");
    for (var i = 0; i < ballVelocity.length; i++){
        power[i] = (targetLocation[i] - ballLocation[i])/(FPS);
        if (i == 1){ // very strong nerf to x speed
            power[i]/=1.5
        }
        ballVelocity[i] = power[i];
    }
}

window.onload = function() {
    canvas = document.getElementById('gameCanvas');
    canvasContext = canvas.getContext('2d');

    maxPower = Math.sqrt(canvas.width*canvas.width + canvas.height*canvas.height)/FPS;

    boardLocation = [canvas.width - boardBuffer - boardWidth - board.width, boardBuffer]
    
    drawEverything();
    
    setInterval(function() {
        moveEverything();
        drawEverything();
    }, 100/FPS);
    
    canvas.addEventListener('mousemove',
        function(evt) {
            var mousePos = calculateMousePos(evt);
            if (actionCycle[0]){ // placing the ball with the mouse
                ballLocation[0] = mousePos.x;
                ballLocation[1] = mousePos.y;
                bowLocation[0] = ballLocation[0];
                bowLocation[1] = ballLocation[1];
            }
            else if (actionCycle[1] || actionCycle[2]){ // placing the target with the mouse before and after the shot, but not while placing the bow
                targetLocation[0] = mousePos.x;
                targetLocation[1] = mousePos.y;
            }
            // console.log("Mouse Motion!");
        });
    
    canvas.addEventListener('click',
        function(evt) {
            var mousePos = calculateMousePos(evt);
            if (actionCycle[0]){ // place the ball
                targetLocation[0] = mousePos.x;
                targetLocation[1] = mousePos.y;
                showTarget = true;
                showPath = true;
            }                   
            else if (actionCycle[1]){ // fire the ball
                showPath = false;
                showBall = true;
                fire(mousePos.x, mousePos.y);
            }
            else if (actionCycle[2]){ // reset properties of the ball after watching it fly
                ballVelocity[0] = 0;
                ballVelocity[1] = 0;
                showBall = false;
                showTarget = false;
            }
            for (var i = 0; i < actionCycle.length; i++){ // cycles between each actions on each click
                if (actionCycle[i]){
                    console.log("Cycle : ", i);
                    actionCycle[i] = false;
                    actionCycle[(i+1) % actionCycle.length] = true;
                    break;
                }
            }
            console.log("Mouse Click!");
        });
} // window.onload

function moveEverything() {         
    if (boardLocation[1] + boardHeight >= groundHeight - boardBuffer){
        boardLocation[1] = groundHeight - boardBuffer - boardHeight;
        boardSpeed[1] = -boardSpeed[1];         
    }
    else if (boardLocation[1] <= boardBuffer){
        boardLocation[1] = boardBuffer;
        boardSpeed[1] = -boardSpeed[1];
    }
    boardLocation[1] += boardSpeed[1];
    
    if (ballLocation[1] >= groundHeight) { // ground collision, not falling
        console.log("Ground Collision!");
        ballVelocity[0] = 0;
        ballVelocity[1] = 0;
    }
    else if (ballLocation[0] + ballWidth >= boardLocation[0] && 
                ballLocation[0] + ballWidth <= boardLocation[0] + boardWidth &&
                ballLocation[1] + ballHeight >= boardLocation[1] &&
                ballLocation[1] + ballHeight <= boardLocation[1] + boardHeight) { // target collision, sticking to target
        console.log("Target Collision!");
        ballVelocity[0] = 0;
        ballVelocity[1] = 0;
        ballLocation[0] += boardSpeed[0];
        ballLocation[1] += boardSpeed[1];
    }
    else{ // above ground, still falling
        if (actionCycle[2]){
            ballVelocity[1] += GRAVITY/FPS;
            for (var i = 0; i < ballVelocity.length; i++){
                ballLocation[i] += ballVelocity[i];
                //console.log(ballLocation[i]);
            }   
        }
    }   
    
}

function drawEverything() {
    // background
    // only meant for me to see where the canvas starts and ends
    canvasContext.fillStyle = 'black';
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);
    
    var lowestHeight = -1;
    
    // sky top background
    for (var i = 0; i < Math.ceil(canvas.width/sky_top.width); i++){
        canvasContext.drawImage(sky_top, 
                                i*sky_top.width, lowestHeight, 
                                sky_top.width, sky_top.height)
    }
    
    // sky trees background
    lowestHeight += -1 + sky_top.height/1.1
    for (var i = 0; i < Math.ceil(canvas.width/sky_background.width); i++){
        canvasContext.drawImage(sky_background, 
                                i*sky_background.width, lowestHeight, 
                                sky_background.width, sky_background.height)
    }
    
    // grass blades background 
    lowestHeight += -1 + sky_background.height - grass.height/1.5
    <!-- canvasContext.drawImage(grass_blades[0],  -->
                <!-- 16*grass.width, lowestHeight - grass_blades[0].height,  -->
                <!-- grass.width, grass.height) -->
    <!-- canvasContext.drawImage(grass_blades[1],  -->
                <!-- 5*grass.width, lowestHeight - grass_blades[1].height,  -->
                <!-- grass.width, grass.height) -->
    <!-- canvasContext.drawImage(grass_blades[2],  -->
                <!-- 8*grass.width, lowestHeight - grass_blades[2].height,  -->
                <!-- grass.width, grass.height) -->
    <!-- canvasContext.drawImage(grass_blades[3],  -->
                <!-- 13*grass.width, lowestHeight - grass_blades[3].height,  -->
                <!-- grass.width, grass.height) -->
    
    <!-- // broken code for randomizing grass locations -->
    <!-- var empty = []; // boolean array to show which tiles are occupied by grass -->
    <!-- for (var i = 0; i < Math.ceil(canvas.width/grass.width); i++){ -->
        <!-- empty[i] = true; -->
    <!-- } -->
    <!-- //console.log("empty length : ", empty.length); -->
    <!-- for (var i = 0; i < grass_blades.length; i++){ -->
        <!-- if (firstRender){ -->
            <!-- if (i == grass_blades.length -1){ -->
                <!-- firstRender = false; -->
            <!-- }                   -->
            <!-- do{ -->
                <!-- x = Math.floor(Math.random()*empty.length); -->
            <!-- } while (!empty[x]); -->
                <!-- empty[x] = false; -->
        <!-- } -->
        <!-- canvasContext.drawImage(grass_blades[i],  -->
                                <!-- x*grass.width, lowestHeight - grass_blades[i].height,  -->
                                <!-- grass.width, grass.height) -->
    <!-- } -->
    //console.log("number of grass tiles : ", Math.ceil(canvas.width/grass.width));         
    
    
    // grass background
    groundHeight = lowestHeight;
    for (var i = 0; i < Math.ceil(canvas.width/grass.width); i++){
        canvasContext.drawImage(grass, 
                                i*grass.width, lowestHeight, 
                                grass.width, grass.height)
    }
    <!-- console.log("number of grass tiles : ", Math.ceil(canvas.width/grass.width)); -->
    
    // stone background
    lowestHeight += -1 + grass.height
    for (var i = 0; i < Math.ceil(canvas.width/stone.width); i++){
        canvasContext.drawImage(stone, 
                                i*stone.width, lowestHeight, 
                                stone.width, stone.height)
    }
    
    <!-- // gold background -->
    <!-- lowestHeight += -1 + grass.height -->
    <!-- for (var i = 0; i < Math.ceil(canvas.width/gold.width); i++){ -->
        <!-- lowestHeight -->
        <!-- canvasContext.drawImage(gold,  -->
                                <!-- i*gold.width, lowestHeight,  -->
                                <!-- gold.width, gold.height) -->
    <!-- } -->
    
    <!-- // gold background -->
    <!-- lowestHeight += -1 + grass.height -->
    <!-- for (var i = 0; i < Math.ceil(canvas.width/gold.width); i++){ -->
        <!-- lowestHeight -->
        <!-- canvasContext.drawImage(gold,  -->
                                <!-- i*gold.width, lowestHeight,  -->
                                <!-- gold.width, gold.height) -->
    <!-- } -->
    
    // board
    canvasContext.fillStyle = 'white';
    canvasContext.fillRect(boardLocation[0], boardLocation[1], boardWidth, boardHeight);
    canvasContext.drawImage(board, 
                            boardLocation[0] - board.width/2, 
                            boardLocation[1]);
    
    if (showBow){                   
        powerFraction = Math.sqrt(power[0]*power[0] + power[1]*power[1])/maxPower;
        
        var level = powerFraction % 10 + 1; // ranges from 1 to 10 and decides which bow sprite is used                 
        //var stretchFactor = 1.6
        var column;
        if (actionCycle[2]){ // arrow already fired
            column = 0;
        }
        else {
            column = 1;
        }
        var dx = targetLocation[0] - bowLocation[0];
        var dy = targetLocation[1] - bowLocation[1];
        var dr = Math.sqrt(dx*dx + dy*dy);
        var rad = Math.asin(dx/dr);
        <!-- if (actionCycle[1]){ -->
            <!-- canvasContext.save(); -->
            <!-- canvasContext.translate(canvas.width/2, canvas.height/2); -->
            <!-- canvasContext.rotate(Math.PI/2-rad); -->
        <!-- } -->
        canvasContext.drawImage(bow,
                                column*BOW_WIDTH, 0,
                                BOW_WIDTH, BOW_HEIGHT,
                                bowLocation[0] - BOW_WIDTH/2*BOW_RESIZE_FACTOR, 
                                bowLocation[1] - BOW_HEIGHT/2*BOW_RESIZE_FACTOR,
                                BOW_WIDTH*BOW_RESIZE_FACTOR, 
                                BOW_HEIGHT*BOW_RESIZE_FACTOR);
        <!-- if (actionCycle[1]){ -->
            <!-- canvasContext.restore(); -->
        <!-- } -->
    }
    
    // ball / arrow
    if (showBall){
        <!-- canvasContext.fillStyle = 'red'; -->
        <!-- canvasContext.fillRect(ballLocation[0], ballLocation[1], 40, 5); -->
        canvasContext.drawImage(arrow, 
                                ballLocation[0] - arrow.height/2,
                                ballLocation[1] - arrow.width/2,
                                arrow.width, 
                                arrow.height);
    }
    
    // target
    if (showTarget){
        <!-- canvasContext.fillStyle = 'green'; // basic bug testing target -->
        <!-- canvasContext.fillRect(targetLocation[0], targetLocation[1], 10, 10); -->
        canvasContext.drawImage(target, 
                                targetLocation[0], targetLocation[1],
                                target.width, target.height); // second coorindate enables scaling
    }
    
    // projectile trajectory
    <!-- if (showPath){ -->
        <!-- canvasContext.beginPath(); -->
        <!-- canvasContext.beginPath(); -->
        <!-- canvasContext.moveTo(ballLocation[0], ballLocation[1]); -->
        <!-- canvasContext.lineTo(targetLocation[0] + TARGET_DIMENSIONS/2,  -->
                                <!-- targetLocation[1] + TARGET_DIMENSIONS/2); // should not be 100 -->
        <!-- canvasContext.lineWidth = 2; -->
        <!-- canvasContext.strokeStyle = 'orange'; -->
        <!-- canvasContext.stroke();             -->
    <!-- } -->
} // drawEverything
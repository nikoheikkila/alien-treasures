/**
 * HTML5 treasure chest hunting game made with Pixi.js library.
 * @author Niko Heikkilä <yo@nikoheikkila.com>
 * @license MIT
 */

/**
 * Current solution uses a lot of global variables.
 * TODO: Refactor players, chests and game management attributes inside classes.
 */
let renderer, stage, textures, p1, p2, chest, speed, styles, scores, gui, audio;

let width   = window.innerWidth;    // Browser width.
let height  = window.innerHeight;   // Browser height.

let keys = {};                      // Object storing the statuses of keys.

/* Player inputs are added as event listeners. */
window.addEventListener('keydown', function(e) {
    keys[e.keyCode] = true;
}, false);

window.addEventListener('keyup', function(e) {
    keys[e.keyCode] = false;
}, false);

/* Player movement. */
let move = function(player, modifier) {
    player.position.x += Math.cos(player.rotation - (Math.PI) / 2) * modifier;
    player.position.y += Math.sin(player.rotation - (Math.PI) / 2) * modifier;
};

/* Player rotation or "stirring". */
let stir = function(player, modifier) {
    player.rotation += modifier;
};

/* Collision detection between a player and a chest. */
let collision = function(p, c) {

    // TODO: Tune hitboxes to be more accurate
    if (p.position.x + p.width > c.position.x  &&
        p.position.x < c.position.x + c.width  &&
        p.position.y + p.height > c.position.y &&
        p.position.y < c.position.y + c.height) {
            audio.chestCollected.play();
            newChest();
            return true;
        }

    return false;
};

/* Adding chests to game. This is called everytime when player collects a chest. */
let newChest = function() {

    if (typeof chest === 'object' && chest.visible)
        stage.removeChild(chest);

    chest = new PIXI.Sprite(textures.chest);
    stage.addChild(chest);
    chest.position = {
        x: Math.floor(Math.random() * (width   - 64) + 1),
        y: Math.floor(Math.random() * (height  - 64) + 1)
    };
};

let newPlayers = function() {
    p1.position.x = Math.floor(Math.random() * (width  - 32) + 1);
    p1.position.y = Math.floor(Math.random() * (height - 32) + 1);
    p2.position.x = Math.floor(Math.random() * (width  - 32) + 1);
    p2.position.y = Math.floor(Math.random() * (height - 32) + 1);
};

/* Manages score updating and checks for victory condition in game. */
let manageScore = function(player) {

    switch (player) {
        case 1:
            scores.player1Score++;
            if (scores.player1Score === 10)
                setWinner('1');
            else
                gui.scoreText1.text = 'Player 1: ' + scores.player1Score;
            break;
        case 2:
            scores.player2Score++;
            if (scores.player2Score === 10)
                setWinner('2');
            else
                gui.scoreText2.text = 'Player 2: ' + scores.player2Score;
            break;
        default:
            break;
    }
};

/* Reset scores when game is reset */
let resetScores = function() {
    scores.player1Score = 0;
    scores.player2Score = 0;
    gui.scoreText1.text = 'Player 1: ' + scores.player1Score;
    gui.scoreText2.text = 'Player 2: ' + scores.player2Score;
};

/* Praises the winner and resets the game */
let setWinner = function(winner) {
    console.log('Player ' + winner + ' won!');
    audio.fanfare.play();
    reset();
};

/* Resets the game in the beginning, when pressing `R` and after each victory. */
let reset = function() {

    /* Reset scores */
    resetScores();

    /* Randomize player positions. */
    newPlayers();

    /* Add chest to the map */
    newChest();
};

/**
 * This function is called 60 times per second.
 * @return void
 */
let update = function() {
    requestAnimationFrame(update);

    /** Player 1 controls **/
    if (keys[38]) move(p1, speed.movement);         // Up arrow
    if (keys[40]) move(p1, speed.movement * -0.5);  // Down arrow
    if (keys[39]) stir(p1, speed.rotation);         // Right arrow
    if (keys[37]) stir(p1, speed.rotation * -1);    // Left arrow

    /** Player 2 controls **/
    if (keys[87]) move(p2, speed.movement);         // W
    if (keys[83]) move(p2, speed.movement * -0.5);  // S
    if (keys[68]) stir(p2, speed.rotation);         // D
    if (keys[65]) stir(p2, speed.rotation * -1);    // A

    if (keys[82]) reset();                          // R

    /* Hitboxes and collisions */
    if (collision(p1, chest))
        manageScore(1);
    else if (collision(p2, chest))
        manageScore(2);

    /* Circular level */
    if (p1.position.x > width)
        p1.position.x = 0;
    else if (p1.position.x < 0)
        p1.position.x = width;

    if (p1.position.y > height)
        p1.position.y = 0;
    else if (p1.position.y < 0)
        p1.position.y = height;

    if (p2.position.x > width)
        p2.position.x = 0;
    else if (p2.position.x < 0)
        p2.position.x = width;

    if (p2.position.y > height)
        p2.position.y = 0;
    else if (p2.position.y < 0)
        p2.position.y = height;

    renderer.render(stage);
};

/**
 * Initialize game and its assets etc. here
 * @return void
 */
let start = function() {

    renderer = new PIXI.WebGLRenderer(width, height, { backgroundColor: '0x00A186' });
    stage = new PIXI.Container();

    /* Textures */
    textures = {
        player1: PIXI.Texture.fromImage('graphics/p1.png'),
        player2: PIXI.Texture.fromImage('graphics/p2.png'),
        chest: PIXI.Texture.fromImage('graphics/chest.png')
    };

    /* Audio assets */
    audio = {
        chestCollected: new Audio('audio/chest.mp3'),
        fanfare: new Audio('audio/fanfare.mp3')
    };

    p1       = new PIXI.Sprite(textures.player1);
    p2       = new PIXI.Sprite(textures.player2);
    styles   = {
        font: '24px Arial',
        fill: 0xF0F0F0,
        lineHeight: 30
    };

    speed   = { movement: 10.0, rotation: 0.1 };
    scores  = {
        player1Score: 0,
        player2Score: 0
    };

    /* GUI Texts */
    let scheme = "Controls\n\nPlayer 1 - Arrows\nPlayer 2 - W, A, S, D\nR - Reset Game";
    gui = {
        controlScheme: new PIXI.Text(scheme, styles),
        scoreText1: new PIXI.Text('Player 1: ' + scores.player1Score, styles),
        scoreText2: new PIXI.Text('Player 2: ' + scores.player2Score, styles)
    };

    /* Adding the elements */
    stage.addChild(p1);
    stage.addChild(p2);
    stage.addChild(gui.controlScheme);
    stage.addChild(gui.scoreText1);
    stage.addChild(gui.scoreText2);

    gui.controlScheme.position  = { x: 30, y: height - 200};
    gui.scoreText1.position     = { x: 30, y: 10 };
    gui.scoreText2.position     = { x: width - 150, y: 10 };

    document.body.appendChild(renderer.view);
    reset();
    update();
};

start();

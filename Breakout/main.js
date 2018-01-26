var game = new Phaser.Game(800, 600, Phaser.AUTO);

var gameState = {
	preload: preload, create: create, update: update
};

// Game Variables
var isPlaying;
var ball;
var paddle;
var bricks;
var newBrick;
var brickInfo;
var score = 0;
var scoreText;
var maxLives = 3;
var currLives;
var lives;
var newLife;
var startText;
var level;
var levelName;
var levelOn;
var gameOverText;
var paddleChangeDirOffset = 28;
var stage2Tint = 14004483;
var stage3Tint = 79038593;

function preload(){
	game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
	game.scale.pageAlignHorizontally = true;
	game.scale.pageAlignVertically = true;
	game.stage.backgroundColor = '#eee';

	// Load images
	game.load.image('ball', 'assets/images/ball.png');
	game.load.image('paddle', 'assets/images/paddle.png');
	game.load.image('brick', 'assets/images/brick.png');
	game.load.image('life', 'assets/images/ball.png');
	game.load.image('start', 'assets/images/start.png');

	// Load animation
	game.load.spritesheet('ball', 'assets/images/wobble.png', 20, 20);

	// Load levels file
	//game.load.text('levels', 'testLevels.json');
	game.load.text('levels', 'levels.json');
};

function create(){
	isPlaying = false;
	// Set arcade physics
	game.physics.startSystem(Phaser.Physics.ARCADE);
	// Position ball and paddle
	ball = game.add.sprite(game.world.width*0.5, game.world.height-25, 'ball');
	ball.animations.add('wobble', [0,1,0,2,0], 24);
	ball.anchor.set(0.5);
	paddle = game.add.sprite(game.world.width*0.5 , game.world.height-5, 'paddle');
	paddle.anchor.set(0.5, 1);


	// Enable physics for ball paddle
	game.physics.enable(ball, Phaser.Physics.ARCADE);
	game.physics.enable(paddle, Phaser.Physics.ARCADE);
	// Disable bottom wall collision
	game.physics.arcade.checkCollision.down = false;

	ball.checkWorldBounds = true;
	ball.events.onOutOfBounds.add(passBall, this);

	ball.body.collideWorldBounds = true;
	ball.body.bounce.set(1); ////////////////
	paddle.body.immovable = true;

	//Create the bricks
	//initBricks();

	// Parse levels file
	game.levels = JSON.parse(this.game.cache.getText('levels'));

	// Set the level
	levelOn = 2;

	loadLevel(levelOn);
	// Show level name
	levelName = game.add.text(5, 5, 'Level ' + levelOn, {font: '18px Arial', fill: '#0095DD'});

	// Create score
	scoreText = game.add.text(75, 5, 'Score: 0', {font: '18px Arial', fill: '#0095DD'});
	// Show remaining lives
	currLives = maxLives;
	initLives();

	// Start button
	startText = game.add.text(game.world.centerX, game.world.centerY, 'Click to start', {font: '28px Arial', fill: '#0095DD'});
	startText.anchor.setTo(0.5, 0.5);
	game.input.onDown.add(clickStart, this);
};

function update(){
	game.physics.arcade.collide(ball, paddle, ballHitPaddle);
	game.physics.arcade.collide(ball, bricks, ballHitBrick);
	paddle.x = game.input.x || game.world.width;
	if(!isPlaying){
		ball.x = paddle.x;
	}
};

game.state.add('gameState', gameState);
game.state.start('gameState');

////////// Game Functions //////////

function loadLevel(levelNum){
	// use this to load a level
	// calls init bricks on levelNum-1 to fit array
	// ex. loadLevel(1) loads the first level (index 0 in level array)
	initBricks(game.levels.levels[levelNum-1]);
}

function initBricks(brickArray){
	// sets all the bricks in a level
	// if you wish to load a level, please use the loadLevel function
	// passing simply the level you wish to load
	brickInfo = {
		width: 50,
		height: 50,
		count: {
			row: 9, // val of 7. 3 in debug mode for brevity
			col: 3
		},
		offset: {
			top: 50,
			left: 150
		},
		padding: 10,
		stage: 1
	};

	bricks = game.add.group();
	let currBrick = 0;
	for(c=0; c < brickInfo.count.col; c++){
		for(r=0; r < brickInfo.count.row; r++){
			var brickX = (r*(brickInfo.width+brickInfo.padding))+brickInfo.offset.left;
			var brickY = (c*(brickInfo.height+brickInfo.padding))+brickInfo.offset.top;

			brickType = brickArray[currBrick];
			newBrick = game.add.sprite(brickX, brickY, 'brick');
			switch (brickType) {
				case 2:
					newBrick.tint = stage2Tint;//1702975; // light green
					newBrick.stage = brickType;
					break;

				case 3:
					newBrick.tint = stage3Tint; // dark green
					newBrick.stage = brickType;
					break;

				default:
					newBrick.stage = brickType;
					break;

			}
			game.physics.enable(newBrick, Phaser.Physics.ARCADE);
			newBrick.body.immovable = true;
			newBrick.anchor.set(0.5);
			bricks.add(newBrick);
			currBrick++;
		}
	}
}

function initLives(){
	// Show remaining lives
	lives = game.add.group();
	for(i = 1; i <= maxLives; i++){
		newLife = game.add.sprite(game.world.width-(30*i), 10, 'life');
		lives.add(newLife);
	}
}

function ballHitBrick(ball, brick){
	console.log(brick.stage);
	switch (brick.stage) {
		case 3:
			brick.stage--;
			brick.tint = stage2Tint;
			break;
		case 2:
			brick.stage--;
			brick.tint = 16777215;
			break;
		default:
			brick.kill();

	}
	score += 10;
	scoreText.setText('Score: ' + score);

	ball.animations.play('wobble');

	var count_alive = 0;
	for(i=0; i < bricks.children.length; i++){
		if(bricks.children[i].alive){
			count_alive++;
		}
	}

	if(count_alive == 0){
		playNextLevel();
	}
}

function ballHitPaddle() {
	ball.animations.play('wobble');
	if((ball.body.velocity.x > 0 && ball.x < paddle.x-paddleChangeDirOffset) ||
		(ball.body.velocity.x < 0 && ball.x > paddle.x+paddleChangeDirOffset)) {
			ball.body.velocity.x *= -1;
	}
}

function passBall(){
	if(currLives == 0){
		gameOverText = game.add.text(game.world.centerX, game.world.centerY, 'Game Over. Your score: ' + score, {font: '28px Arial', fill: '#0095DD'});
		gameOverText.anchor.setTo(0.5, 0.5);
	} else {
		currLives--;
		lives.children[currLives].kill();
		ball.reset(game.world.width*0.5, game.world.height-25);
		paddle.reset(game.world.width*0.5, game.world.height-5);
		startBallMovement();
	}
}

function clickStart(){
	if(!isPlaying){
		startGame();
	}
}

function startGame() {
	isPlaying = true;
	startText.kill();
	startBallMovement();
}

function startBallMovement(){
	// Create random direction 0 or 1
	var dir = Math.floor(Math.random()*2);
	if(dir == 0){
		dir = -1;
	}
	ball.body.velocity.set(dir*150, -150);
}

function playNextLevel() {
	if(levelOn < game.levels.levels.length){
		levelOn++;
		loadLevel(levelOn);
		levelName.text = 'Level ' + levelOn;
		isPlaying = false;
		ball.y = game.world.height-25;
		ball.body.velocity.set(0,0);
		startText = game.add.text(game.world.centerX, game.world.centerY, 'Click to start', {font: '28px Arial', fill: '#0095DD'});
		startText.anchor.setTo(0.5, 0.5);
	} else {
		ball.body.velocity.set(0,0);
		gameOverText = game.add.text(game.world.centerX, game.world.centerY, 'Congratulations, you win!', {font: '48px Arial', fill: '#0095DD'});
		gameOverText.anchor.setTo(0.5, 0.5);
	}
}

///////////////////////////////////////////////////////////////////
// 		Level takes in array of bricks
// 		i.e. [3,3,3,2,2,2,1,1,1] for a 3x3 brick level
///////////////////////////////////////////////////////////////////


//var name;
//scoreText = game.add.text(5, 5, 'Score: 0', {font: '18px Arial', fill: '#0095DD'});

// Score bonus after level complete based on how many lives left
// Score per brick should increase per level

function Level(bricks){
	this.levelBricks = bricks;
	this.initBricks = initBricks();
}

function initBricks(){
	brickInfo = {
		width: 50,
		height: 50,
		count: {
			row: 3,
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

			brickType = levelBricks[currBrick];
			newBrick = game.add.sprite(brickX, brickY, 'brick');
			switch (brickType) {
				case 2:
					newBrick.tint = 1702975;
					break;

				case 3:
					newBrick.tint = 14004483;
					break;

				default:
				//	break;

			}
			game.physics.enable(newBrick, Phaser.Physics.ARCADE);
			newBrick.body.immovable = true;
			newBrick.anchor.set(0.5);
			bricks.add(newBrick);
			currBrick++;
		}
	}
}

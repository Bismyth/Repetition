var score = 1;

class StartScreen extends Phaser.Scene {
  constructor() { super('StartScreen') }
  preload() { this.load.image('tiles', 'img/Tiles.png') }
  create() {
    this.add.text(170, 240, "Your goal is to escape the maze.\n\nUse the arrow keys to move.\n\n\n\nPress any key to continue...", {
      fontSize: '14px', fill: '#fff', fontFamily: 'PressStart2P', fixedHeight:"200",align:"center"
    })
    var s = this.scene
    this.input.keyboard.on('keyup',function() {
      s.switch('MainMaze')
    })
  }
  update() { }
}


class MainMaze extends Phaser.Scene {
  constructor() { super('MainMaze') }
  preload() {
    this.load.image('tiles', 'img/Tiles.png')
    this.load.image('mask', 'img/mask1.png');
    this.load.tilemapTiledJSON('map', 'data/Maze.json')
    this.load.multiatlas('Player', 'data/Wizard.json', 'img')
  }
  create() { initiate(this, 'map') }
  update() { gameTick(this) }
}

class EscapeMaze extends Phaser.Scene {
  constructor() { super('EscapeMaze') }
  preload() {
    this.load.tilemapTiledJSON('map1', 'data/Maze1.json')
  }
  create() { initiate(this, 'map1') }
  update() { gameTick(this) }
}

class WinScreen extends Phaser.Scene {
  constructor() { super('WinScreen') }
  preload() { }
  create() {
    this.add.text(280, 300, "You Win", { fontSize: '32px', fill: '#fff', fontFamily: 'PressStart2P' })
  }
  update() { }
}

function initiate(game, m) {
  const container = game.add.container(0, 0).setName('background');
  const map = game.make.tilemap({ key: m })
  const tileset = map.addTilesetImage('Test', 'tiles')
  const floor = map.createLayer('Floor', tileset, 0, 0);
  const walls = map.createLayer('Walls', tileset, 0, 0);
  const tops = map.createLayer('Tops', tileset, 0, 0);
  walls.setCollisionBetween(0, 1000)
  container.add(floor)
  container.add(walls)
  container.add(tops)
  game.spotlight = game.make.sprite({
    x: 400,
    y: 300,
    key: 'mask',
    add: false
  });
  game.spotlight.scale = 1.5;
  container.mask = new Phaser.Display.Masks.BitmapMask(game, game.spotlight);
  game.scoreText = game.add.text(640, 600, 'Level: ' + score, { fontSize: '14px', fill: '#fff', fontFamily: 'PressStart2P' });

  game.player = game.physics.add.sprite(-200, 274, "Player", "2/1.png")
  game.player.body.setSize(16, 16)
  game.player.body.setOffset(0, 16)
  game.player.scale = 2

  game.player.moveSpeed = 170;
  game.player.canMove = true;
  game.directions = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw']
  for (var i = 0; i < 8; i++) {
    game.anims.create({
      key: game.directions[i],
      frames: game.anims.generateFrameNames("Player", { prefix: i + "/", start: 1, end: 4, suffix: '.png' }),
      frameRate: 8,
      repeat: -1
    })
  }
  game.cursorKeys = game.input.keyboard.createCursorKeys()
  game.physics.add.collider(game.player, walls)
}

function gameTick(game) {
  movePlayer(game)
  game.spotlight.x = game.player.x
  game.spotlight.y = game.player.y
}

function movePlayer(game) {
  var d = '';
  if (game.cursorKeys.up.isDown) {
    d += 'n'
  }
  if (game.cursorKeys.down.isDown) {
    d += 's'
  }
  if (game.cursorKeys.left.isDown) {
    d += 'w'
  }
  if (game.cursorKeys.right.isDown) {
    d += 'e'
  }
  if (d == '') {
    game.player.stop()
  }
  game.player.setVelocityY(0);
  game.player.setVelocityX(0);
  if (game.directions.includes(d) && game.player.canMove) {
    var factor = 1;
    if (d.length == 2) {
      factor = 0.8
    }
    if (d.includes('n')) {
      game.player.setVelocityY(-game.player.moveSpeed * factor);
    }
    if (d.includes('s')) {
      game.player.setVelocityY(game.player.moveSpeed * factor);
    }
    if (d.includes('w')) {
      game.player.setVelocityX(-game.player.moveSpeed * factor);
    }
    if (d.includes('e')) {
      game.player.setVelocityX(game.player.moveSpeed * factor);
    }
    game.player.play(d, true)
  }
  if (game.player.x > game.cameras.main.width) {
    game.player.canMove = false
    game.player.setVelocityX(game.player.moveSpeed);
  }

  if (game.player.x > game.cameras.main.width + 200) {
    score++;
    game.scoreText.setText("Level: " + score)
    if (game.scene.settings.key == 'EscapeMaze') {
      game.scene.restart()
    } else {
      if(score > Math.floor(Math.random()*4+2)){
        game.scene.switch('EscapeMaze')
      } else {
        game.scene.restart()
      }
      
    }
  }
  if (game.player.x < 0) {
    game.player.canMove = false
    game.player.setVelocityX(game.player.moveSpeed);
  }
  if (game.player.x > 0 && game.player.x < game.cameras.main.width) {
    game.player.canMove = true
  }
  if (game.player.y > game.cameras.main.height) {
    game.player.canMove = false
    game.player.setVelocityY(game.player.moveSpeed);
  }
  if (game.player.y > game.cameras.main.height + 200) {
    game.scene.switch("WinScreen")
  }
}

var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 640,
  scene: [StartScreen, MainMaze, EscapeMaze, WinScreen],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  backgroundColor: "#222222"
};

var game = new Phaser.Game(config);
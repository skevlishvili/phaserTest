/**
 * Author: Michael Hadley, mikewesthad.com
 * Asset Credits:
 *  - Tuxemon, https://github.com/Tuxemon/Tuxemon
 */

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: "game-container",
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 }
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);

let map
let cursors;
let player;
let showDebug = false;

let worldLayer
let aboveLayer

let marker;
let shiftKey;
let inventoryItem;



let one;
let two;
let three;
let four;

const Inventory = []

let currentInv = 1

function preload() {
  this.load.image("tiles", "../assets/tilesets/tuxmon-sample-32px-extruded.png");
  this.load.image("inv1", "../assets/inventory/1.png");
  this.load.image("inv2", "../assets/inventory/2.png");
  this.load.image("inv3", "../assets/inventory/3.png");
  this.load.image("inv4", "../assets/inventory/4.png");
  this.load.tilemapTiledJSON("map", "../assets/tilemaps/tuxemon-town.json");
  this.load.atlas("atlas", "../assets/atlas/atlas.png", "../assets/atlas/atlas.json");
}

function create() {


  one = this.input.keyboard.addKey('ONE');
  two = this.input.keyboard.addKey('TWO');
  three = this.input.keyboard.addKey('THREE');
  four = this.input.keyboard.addKey('FOUR');

  // keyObj.on('down', () => { console.log("down") })


  map = this.make.tilemap({ key: "map" });

  shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

  // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
  // Phaser's cache (i.e. the name you used in preload)
  const tileset = map.addTilesetImage("tuxmon-sample-32px-extruded", "tiles");




  // Parameters: layer name (or index) from Tiled, tileset, x, y
  const belowLayer = map.createDynamicLayer("Below Player", tileset, 0, 0);
  worldLayer = map.createDynamicLayer("World", tileset, 0, 0);
  aboveLayer = map.createDynamicLayer("Above Player", tileset, 0, 0);

  worldLayer.setCollisionByProperty({ collides: true });

  // By default, everything gets depth sorted on the screen in the order we created things. Here, we
  // want the "Above Player" layer to sit on top of the player, so we explicitly give it a depth.
  // Higher depths will sit on top of lower depth objects.
  aboveLayer.setDepth(10);

  // Object layers in Tiled let you embed extra info into a map - like a spawn point or custom
  // collision shapes. In the tmx file, there's an object layer with a point named "Spawn Point"
  const spawnPoint = map.findObject("Objects", obj => obj.name === "Spawn Point");

  // Create a sprite with physics enabled via the physics system. The image used for the sprite has
  // a bit of whitespace, so I'm using setSize & setOffset to control the size of the player's body.
  player = this.physics.add
    .sprite(spawnPoint.x, spawnPoint.y, "atlas", "misa-front")
    .setSize(30, 40)
    .setOffset(0, 24);




  // Watch the player and worldLayer for collisions, for the duration of the scene:
  this.physics.add.collider(player, worldLayer);

  // Create the player's walking animations from the texture atlas. These are stored in the global
  // animation manager so any sprite can access them.
  const anims = this.anims;
  anims.create({
    key: "misa-left-walk",
    frames: anims.generateFrameNames("atlas", {
      prefix: "misa-left-walk.",
      start: 0,
      end: 3,
      zeroPad: 3
    }),
    frameRate: 10,
    repeat: -1
  });
  anims.create({
    key: "misa-right-walk",
    frames: anims.generateFrameNames("atlas", {
      prefix: "misa-right-walk.",
      start: 0,
      end: 3,
      zeroPad: 3
    }),
    frameRate: 10,
    repeat: -1
  });
  anims.create({
    key: "misa-front-walk",
    frames: anims.generateFrameNames("atlas", {
      prefix: "misa-front-walk.",
      start: 0,
      end: 3,
      zeroPad: 3
    }),
    frameRate: 10,
    repeat: -1
  });
  anims.create({
    key: "misa-back-walk",
    frames: anims.generateFrameNames("atlas", {
      prefix: "misa-back-walk.",
      start: 0,
      end: 3,
      zeroPad: 3
    }),
    frameRate: 10,
    repeat: -1
  });

  const camera = this.cameras.main;
  camera.startFollow(player);
  camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

  cursors = this.input.keyboard.createCursorKeys();





  // Create a simple graphic that can be used to show which tile the mouse is over
  marker = this.add.graphics();
  marker.lineStyle(5, 0xffffff, 1);
  marker.strokeRect(0, 0, map.tileWidth, map.tileHeight);
  marker.lineStyle(3, 0xff4f78, 1);
  marker.strokeRect(0, 0, map.tileWidth, map.tileHeight);


  for (let i = 0; i < 4; i++) {

    const inventoryItem = this.add.image(322 + i * 50, map.heightInPixels - 707, `inv${i + 1}`)
    inventoryItem.setScrollFactor(0)
    console.log(i + 1)
    inventoryBorder = this.add.graphics();
    inventoryBorder.lineStyle(5, 00000000, 1);
    inventoryBorder.strokeRect(0, 0, map.tileWidth + 13, map.tileHeight + 14);
    inventoryBorder.lineStyle(3, 00000000, 1);
    inventoryBorder.strokeRect(0, 0, map.tileWidth + 13, map.tileHeight + 14);



    Inventory.push(inventoryBorder)


  }




}

function update(time, delta) {
  const speed = 175;
  const prevVelocity = player.body.velocity.clone();




  // Stop any previous movement from the last frame
  player.body.setVelocity(0);

  // Horizontal movement
  if (cursors.left.isDown) {
    player.body.setVelocityX(-speed);
  } else if (cursors.right.isDown) {
    player.body.setVelocityX(speed);
  }

  // Vertical movement
  if (cursors.up.isDown) {
    player.body.setVelocityY(-speed);
  } else if (cursors.down.isDown) {
    player.body.setVelocityY(speed);
  }

  // Normalize and scale the velocity so that player can't move faster along a diagonal
  player.body.velocity.normalize().scale(speed);

  // Update the animation last and give left/right animations precedence over up/down animations
  if (cursors.left.isDown) {
    player.anims.play("misa-left-walk", true);
  } else if (cursors.right.isDown) {
    player.anims.play("misa-right-walk", true);
  } else if (cursors.up.isDown) {
    player.anims.play("misa-back-walk", true);
  } else if (cursors.down.isDown) {
    player.anims.play("misa-front-walk", true);
  } else {
    player.anims.stop();

    // If we were moving, pick and idle frame to use
    if (prevVelocity.x < 0) player.setTexture("atlas", "misa-left");
    else if (prevVelocity.x > 0) player.setTexture("atlas", "misa-right");
    else if (prevVelocity.y < 0) player.setTexture("atlas", "misa-back");
    else if (prevVelocity.y > 0) player.setTexture("atlas", "misa-front");
  }







  // Convert the mouse position to world position within the camera
  const worldPoint = this.input.activePointer.positionToCamera(this.cameras.main);

  // Place the marker in world space, but snap it to the tile grid. If we convert world -> tile and
  // then tile -> world, we end up with the position of the tile under the pointer
  const pointerTileXY = worldLayer.worldToTileXY(worldPoint.x, worldPoint.y);
  const snappedWorldPoint = worldLayer.tileToWorldXY(pointerTileXY.x, pointerTileXY.y);
  marker.setPosition(snappedWorldPoint.x, snappedWorldPoint.y);

  Inventory.map((inventoryBorder, i) => {

    inventoryBorder.setPosition(300 + i * 50, map.heightInPixels - 730)
    inventoryBorder.setScrollFactor(0)
    // const inventoryItem = worldLayer.putTileAtWorldXY(355, worldPoint.x, worldPoint.y);
    // inventoryItem.setScrollFactor(0)

    // const sign = worldLayer.putTileAtWorldXY(355, worldPoint.x, worldPoint.y);
    inventoryBorder.alpha = 0.2

    if (currentInv === i + 1) {

      inventoryBorder.alpha = 1
    }
  })



  if (one.isDown) {
    currentInv = 1
  } else if (two.isDown) {

    currentInv = 2
  } else if (three.isDown) {
    currentInv = 3

  } else if (four.isDown) {
    currentInv = 4

  }


  // Draw or erase tiles (only within the groundLayer)
  if (this.input.manager.activePointer.isDown) {
    if (shiftKey.isDown) {
      worldLayer.removeTileAtWorldXY(worldPoint.x, worldPoint.y);
      aboveLayer.removeTileAtWorldXY(worldPoint.x, worldPoint.y);
    } else {
      const tile = worldLayer.putTileAtWorldXY(currentInv, worldPoint.x, worldPoint.y);
      tile.setCollision(true);
    }
  }


  // sign.setScrollFactor(0)
}

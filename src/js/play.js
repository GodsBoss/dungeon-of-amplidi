class Play extends Phaser.State {
  create() {
    for(var x = 0; x < boardSize.width; x++) {
      for (var y = 0; y < boardSize.height; y++) {
        this.add.sprite(x * tileSize.width + 20, y * tileSize.width + 20, Math.random() > 0.5 ? 'tile_path' : 'tile_rock')
      }
    }

    for(var i = 0; i < maxCards; i++) {
      this.add.sprite(
        tileSize.width * boardSize.width * i / maxCards + 20,
        224,
        "ui_card"
      )
    }

    for(var i = 0; i < maxHeroes; i++) {
      this.add.sprite(
        316,
        tileSize.height * boardSize.height * i / maxHeroes + 20,
        "ui_heroframe"
      )
    }
  }

  update() {}
}

export default { State: Play }

// tileSize is the size of a single tile in pixels.
const tileSize = { width: 12, height: 12 }

// boardSize is the size of the board in tiles.
const boardSize = { width: 24, height: 16 }

// maxCards is the number of cards the player may have.
const maxCards = 5

// maxHeroes is the number of heroes the player has.
const maxHeroes = 4

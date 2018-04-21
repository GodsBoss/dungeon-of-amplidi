class Play extends Phaser.State {
  create() {
    this.board = new Board(this, boardSize)

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

class Board {
  constructor(state, size) {
    this.size = size
    this.tilesGroup = state.add.group()
    this.tilesGroup.classType = Tile
    this.tiles = []

    for(var x = 0; x < this.size.width; x++) {
      for (var y = 0; y < this.size.height; y++) {
        this.addTile(x, y, 'tile_unset')
      }
    }

    for(var ix = 0; ix < 4; ix++) {
      for(var y = Math.floor(this.size.height / 2) - 1; y <= Math.floor(this.size.height / 2); y++) {
        this.setTile([0, 1, this.size.width-2, this.size.width-1][ix], y, 'tile_path')
      }
    }
  }

  tileIndex (x, y) {
    return x + y * this.size.width
  }

  getTile (x, y) {
    return this.tiles[this.tileIndex(x, y)]
  }

  setTile (x, y, key) {
    this.tiles[this.tileIndex(x, y)].destroy()
    this.addTile(x, y, key)
  }

  addTile(x, y, key) {
    this.tiles[this.tileIndex(x, y)] = this.tilesGroup.create(x * tileSize.width + 20, y * tileSize.height + 20, key)
  }
}

class Tile extends Phaser.Sprite {
  constructor(game, x, y, key, frame) {
    super(game, x, y, key, frame)
  }
}

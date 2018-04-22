import v from '../vector'

// tileSize is the size of a single tile in pixels.
const tileSize = { width: 12, height: 12 }

// boardSize is the size of the board in tiles.
const boardSize = { width: 24, height: 16 }

class Board {
  constructor(state, size, onOverlayClick) {
    this.size = size
    this.tilesGroup = state.add.group()
    this.tilesGroup.classType = Tile
    this.tiles = []
    this.overlays = []

    for(var x = 0; x < this.size.width; x++) {
      for (var y = 0; y < this.size.height; y++) {
        this.addTile(x, y, 'tile_unset')
      }
    }

    for (var x = 0; x < this.size.width; x++) {
      for (var y = 0; y < this.size.height; y++) {
        var overlayPos = this.position(x, y)
        var overlaySprite = state.add.sprite(overlayPos.x, overlayPos.y, 'tile_overlay')
        overlaySprite.inputEnabled = true
        overlaySprite.events.onInputUp.add(onOverlayClick)
        this.overlays[this.tileIndex(x, y)] = overlaySprite
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
    const pos = this.position(x, y)
    this.tiles[this.tileIndex(x, y)] = this.tilesGroup.create(pos.x, pos.y, key)
  }

  inside (x, y) {
    return x >= 0 && y >= 0 && x < this.size.width && y < this.size.height
  }

  position (x, y) {
    return { x: x * tileSize.width + 20, y: y * tileSize.height + 20 }
  }

  /**
  * fromPointer takes a pointer and returns the corresponding grid position on the board. May return out-of-bounds position.
  */
  fromPointer (ptr) {
    return {
      x: Math.floor((ptr.x - 20) / tileSize.width),
      y: Math.floor((ptr.y - 20) / tileSize.height)
    }
  }

  getOverlay (x, y) {
    return this.overlays[this.tileIndex(x, y)]
  }

  overlay (offsets) {
    this.overlays.forEach(
      (overlay) => overlay.frame = 0
    )
    offsets.offsets.forEach(
      (offset) => {
        if (this.inside(offset.x, offset.y)) {
          var overlay = this.getOverlay(offset.x, offset.y)
          if (!offset.valid) {
            overlay.frame = 3
          } else if (offsets.areAllValid()) {
            overlay.frame = 1
          } else {
            overlay.frame = 2
          }
        }
      }
    )
  }

  findPassableTiles (currentTile) {
    return [
      { x: -1, y: 0},
      { x: 1, y: 0},
      { x: 0, y: -1},
      { x: 0, y: 1}
    ].map(
      (offset) => v.add(offset, currentTile)
    ).filter(
      (position) => this.inside(position.x, position.y) && this.getTile(position.x, position.y).isPassable()
    )
  }
}

class Tile extends Phaser.Sprite {
  constructor(game, x, y, key, frame) {
    super(game, x, y, key, frame)
  }

  isUnset () {
    return this.key == "tile_unset"
  }

  isPassable() {
    return this.key == "tile_path"
  }

  isRock() {
    return this.key == "tile_rock"
  }
}

export default {
  New: (state, size, onOverlayClick) => new Board(state, size, onOverlayClick),
  size: boardSize,
  Tile,
  tileSize
}

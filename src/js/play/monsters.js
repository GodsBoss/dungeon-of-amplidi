class DungeonHeart {
  constructor (phaserState) {
    const gridX = phaserState.board.size.width-2
    const gridY = Math.floor(phaserState.board.size.height / 2) - 1
    const position = phaserState.board.position(gridX, gridY)
    this.sprite = phaserState.add.sprite(position.x, position.y, 'sprite_dungeonheart')
  }
}

export default {
  DungeonHeart
}

import random from '../random'
import v from '../vector'

class DungeonHeart {
  constructor (phaserState) {
    const gridX = phaserState.board.size.width-2
    const gridY = Math.floor(phaserState.board.size.height / 2) - 1
    const position = phaserState.board.position(gridX, gridY)
    this.sprite = phaserState.add.sprite(position.x, position.y, 'sprite_dungeonheart')
  }
}

class Goblin extends Phaser.Sprite {
  update () {
    if (v.distance(this, this.state.board.position(this.target.x, this.target.y)) < goblinSpeed) {
      var possibleTargets = this.state.board.findPassableTiles(this.target)
      if (possibleTargets.length > 0) {
        this.setTarget(possibleTargets[random.int(0, possibleTargets.length - 1)])
      }
    } else {
      const d = v.diff(this, this.state.board.position(this.target.x, this.target.y))
      const l = v.length(d)
      this.x += goblinSpeed * d.x / l
      this.y += goblinSpeed * d.y / l
    }
  }

  setTarget (target) {
    this.target = target
  }

  setState (state) {
    this.state = state
  }
}

const goblinSpeed = 0.025

export default {
  DungeonHeart,
  Goblin
}

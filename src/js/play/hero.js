import board from './board'
import life from './life'
import random from '../random'
import v from '../vector'

// maxHeroes is the number of heroes the player has.
const maxHeroes = 4

/**
* Party is a group of heroes. A party itself has a position, while the heroes gravitate around it.
* A party will seek (in order):
* 1. Treasure
* 2. Monsters
* 3. Dungeon Heart guardian
* 4. Dungeon Heart
*/
class Party {
  constructor (state, maxHeroes) {
    this.phaserState = state
    this.heroes = []
    this.currentPosition = { x: 1, y: Math.floor(board.size.height / 2) }
    this.target = this.currentPosition
    this.heroes[0] = new Hero(state, this, 0, "knight")
    this.heroes[1] = new Hero(state, this, 1, "cleric")
    this.heroes[2] = new Hero(state, this, 2, "none")
    this.heroes[3] = new Hero(state, this, 3, "none")
    this.heroes.forEach(
      (hero) => hero.setPosition(this.currentPosition.x, this.currentPosition.y)
    )
  }

  update() {
    this.heroes.forEach(
      (hero) => hero.update()
    )
    if (v.distance(this.currentPosition, this.target) <= this.speed()) {
      this.findNextTarget()
    } else {
      const d = v.diff(this.currentPosition, this.target)
      const l = v.length(d)
      this.setPosition(
        v.add(
          this.currentPosition,
          {
            x: this.speed() * d.x / l,
            y: this.speed() * d.y / l
          }
        )
      )
    }
  }

  findNextTarget() {
    var targets = this.phaserState.board.findPassableTiles(this.target)
    if (targets.length > 0) {
      var index = random.int(0, targets.length - 1)
      this.target = targets[index]
    }
  }

  position () {
    return this.currentPosition
  }

  setPosition (position) {
    this.currentPosition = position
  }

  speed () {
    return 0.01
  }
}

class Hero {
  constructor (state, party, index, type) {
    this.party = party
    this.life = heroTemplates[type].life()
    this.index = index
    var pos = this.portraitPosition()
    state.add.sprite(pos.x, pos.y, "ui_heroframe")
    this.portrait = state.add.sprite(pos.x, pos.y, "ui_hero_" + type)
    state.add.sprite(358, pos.y, "ui_herolife")
    this.heroLifeValue = state.add.sprite(359, pos.y + 1, "ui_herolifevalue")
    this.renderHeroLifeValue()
    this.heroSprite = state.add.sprite(0, 0, "sprite_hero_" + type)
    this.position = { x: 0, y: 0 }
    this.speed = 0.1
  }

  portraitPosition () {
    return {
      x: 316,
      y: board.tileSize.height * board.size.height * this.index / maxHeroes + 20
    }
  }

  renderHeroLifeValue () {
    this.heroLifeValue.width = 34 * this.life.percentage()
  }

  /**
  * Sets the hero position, (x, y) is a board position, not pixel coordinates.
  */
  setPosition (x, y) {
    this.heroSprite.x = x * board.tileSize.width + 20 - 6
    this.heroSprite.y = y * board.tileSize.height + 20 - 6
    this.position = { x, y }
  }

  update () {
    this.life.tick()
    this.move(this.party.position())
    this.renderHeroLifeValue()
  }

  move (target) {
    if(v.distance(this.position, target) > maximumHeroPartyDistance) {
      const d = v.diff(this.position, target)
      const l = v.length(d)
      this.setPosition(
        this.position.x + this.speed * d.x / l,
        this.position.y + this.speed * d.y / l
      )
    } else {
      this.setPosition(
        this.position.x + (Math.random() - 0.5) * this.speed,
        this.position.y + (Math.random() - 0.5) * this.speed
      )
    }
  }
}

const maximumHeroPartyDistance = 0.2

var heroTemplates = {
  "none": {
    life: () => {
      var l = life.New(1)
      l.lose(1)
      return l
    }
  },
  "cleric": {
    life: () => life.New(100, 0.1)
  },
  "knight": {
    life: () => life.New(200, 0.2)
  },
}

export default {
  Party
}

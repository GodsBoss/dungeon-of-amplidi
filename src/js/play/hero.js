import behaviour from './behaviour'
import board from './board'
import life from './life'
import skills from './skills'
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
    this.heroes[0] = new Hero(state, this, 0, "knight")
    this.heroes[1] = new Hero(state, this, 1, "none")
    this.heroes[2] = new Hero(state, this, 2, "none")
    this.heroes[3] = new Hero(state, this, 3, "none")
    this.heroes.forEach(
      (hero) => hero.setPosition(this.currentPosition.x, this.currentPosition.y)
    )
    this.behaviour = new behaviour.PursueTarget(behaviour.partyTarget)
  }

  update() {
    this.heroes.forEach(
      (hero) => hero.update()
    )
    this.behaviour.behave(this)
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

  livingHeroes () {
    return this.heroes.filter(
      (hero) => hero.alive()
    )
  }
}

class Hero {
  constructor (state, party, index, type) {
    this.phaserState = state
    this.party = party
    this.life = heroTemplates[type].life()
    this.skill = heroTemplates[type].skill()
    this.index = index
    var pos = this.portraitPosition()
    state.add.sprite(pos.x, pos.y, "ui_heroframe")
    this.portrait = state.add.sprite(pos.x, pos.y, "ui_hero_" + type)
    state.add.sprite(358, pos.y, "ui_herolife")
    this.heroLifeValue = state.add.sprite(359, pos.y + 1, "ui_herolifevalue")
    this.renderHeroLifeValue()
    this.heroSprite = state.add.sprite(0, 0, "sprite_hero_" + type)
    this.heroSprite.animations.add("move", [0, 1], 5, true)
    this.heroSprite.animations.add("skill", [2, 3, 4, 5], 10, true)
    this.heroSprite.animations.add("die", [6, 7], 5, true)
    this.heroSprite.animations.play("move")
    this.currentPosition = { x: 0, y: 0 }
    this.speed = 0.1
    this.state = "move"
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

  position () {
    return this.currentPosition
  }

  /**
  * Sets the hero position, (x, y) is a board position, not pixel coordinates.
  */
  setPosition (x, y) {
    this.heroSprite.x = x * board.tileSize.width + 20 - 6
    this.heroSprite.y = y * board.tileSize.height + 20 - 6
    this.currentPosition = { x, y }
  }

  update () {
    this.heroSprite.bringToTop()
    this.life.tick()
    this.skill.update()
    this.skill.use(this, this.phaserState)
    if (this.skill.inUse() && !this.isPerformingSkill()) {
      this.state = "skill"
      this.heroSprite.animations.play("skill")
    }
    if (!this.skill.inUse() && this.isPerformingSkill()) {
      this.state = "move"
      this.heroSprite.animations.play("move")
    }
    if (this.isMoving()) {
      this.move(this.party.position())
    }
    this.renderHeroLifeValue()
  }

  move (target) {
    if(this.distanceToParty() > maximumHeroPartyDistance) {
      const d = v.diff(this.position(), target)
      const l = v.length(d)
      this.setPosition(
        this.position().x + this.speed * d.x / l,
        this.position().y + this.speed * d.y / l
      )
    } else {
      this.setPosition(
        this.position().x + (Math.random() - 0.5) * this.speed * randomHeroMovementDampingFactor,
        this.position().y + (Math.random() - 0.5) * this.speed * randomHeroMovementDampingFactor
      )
    }
  }

  alive () {
    return !this.life.none()
  }

  distanceToParty() {
    return v.distance(this.position(), this.party.position())
  }

  isMoving() {
    return this.state == "move"
  }

  isPerformingSkill() {
    return this.state == "skill"
  }

  isDying() {
    return this.state == "dying"
  }

  isDead() {
    return this.state == "dead"
  }
}

const randomHeroMovementDampingFactor = 0.25
const maximumHeroPartyDistance = 0.2

var heroTemplates = {
  "none": {
    life: () => {
      var l = life.New(1)
      l.lose(1)
      return l
    },
    skill: () => new skills.None()
  },
  "cleric": {
    life: () => life.New(100, 0.1),
    skill: () => new skills.Heal()
  },
  "knight": {
    life: () => life.New(200, 0.2),
    skill: () => new skills.Attack()
  },
}

export default {
  Party
}

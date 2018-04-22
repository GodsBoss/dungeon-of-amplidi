import array from './array'
import random from './random'
import v from './vector'

import board from './play/board'

class Play extends Phaser.State {
  create() {
    this.board = board.New(this, board.size, this.overlayClick.bind(this))
    this.party = new Party(this, maxHeroes)
    this.cards = new Cards(this)
    this.heart = new DungeonHeart(this)
    this.monsterGroups = {
      "goblins": this.add.group()
    }
    this.monsterGroups['goblins'].classType = Goblin
    this.monsters = []
  }

  update() {
    this.party.update()
    this.cards.update()
    this.board.overlay(this.cards.getUseOverlay(this, this.board.fromPointer(this.input)))
  }

  overlayClick (obj, ptr, stillOver) {
    this.cards.useCard(this, this.board.fromPointer(this.input))
  }
}

export default { State: Play }

// maxCards is the number of cards the player may have.
const maxCards = 5

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
    this.position = { x: 1, y: Math.floor(board.size.height / 2) }
    this.target = this.position
    this.heroes[0] = new Hero(state, this, 0, "knight")
    this.heroes[1] = new Hero(state, this, 1, "cleric")
    this.heroes[2] = new Hero(state, this, 2, "none")
    this.heroes[3] = new Hero(state, this, 3, "none")
    this.heroes.forEach(
      (hero) => hero.setPosition(this.position.x, this.position.y)
    )
  }

  update() {
    this.heroes.forEach(
      (hero) => hero.update()
    )
    if (v.distance(this.position, this.target) <= partySpeed) {
      this.findNextTarget()
    } else {
      const d = v.diff(this.position, this.target)
      const l = v.length(d)
      this.position = v.add(
        this.position,
        {
          x: partySpeed * d.x / l,
          y: partySpeed * d.y / l
        }
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
}

const partySpeed = 0.01

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
    this.move(this.party.position)
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
      var life = new Life(1)
      life.lose(1)
      return life
    }
  },
  "cleric": {
    life: () => new Life(100, 0.1)
  },
  "knight": {
    life: () => new Life(200, 0.2)
  },
}

class Life {
  constructor(maximum, regeneration = 0) {
    this.maximum = maximum
    this.current = maximum
    this.regeneration = regeneration
  }

  tick () {
    this.gain(this.regeneration)
  }

  /**
  * percentage returns the current life amount as a value from 0.0 (none) to 1.0 (full).
  */
  percentage() {
    return this.current / this.maximum
  }

  lose(amount) {
    this.current = Math.max(0, this.current - amount)
  }

  gain(amount) {
    this.current = Math.min(this.maximum, this.current + amount)
  }

  none() {
    return this.current == 0
  }
}

class Cards {
  constructor (state) {
    this.generator = new CardGenerator(state)
    this.slots = []
    for(var i = 0; i < maxCards; i++) {
      this.slots[i] = new CardSlot(state, this, i)
      this.slots[i].setCard(this.generator.create(this.slots[i]))
    }
    this.activeSlot = null
  }

  update() {
    this.slots.forEach(
      (slot) => slot.update()
    )
    var emptySlots = this.emptySlots()
    emptySlots.forEach(
      (slot) => slot.refill(slotRefillFactor * (0.5 + 0.5/emptySlots.length))
    )
  }

  deselectAll() {
    this.slots.forEach(
      (slot) => slot.setState("inactive")
    )
  }

  activate (slot) {
    this.activeSlot = slot
  }

  deactivate (slot) {
    this.activeSlot = null
  }

  getUseOverlay (state, position) {
    if (!this.activeSlot) {
      return new Offsets()
    }
    return this.activeSlot.getUseOverlay(state, position)
  }

  useCard (state, position) {
    if (!this.activeSlot) {
      return
    }
    if (!this.activeSlot.getUseOverlay(state, position).areAllValid()) {
      return
    }
    this.activeSlot.use(state, position)
  }

  emptySlots() {
    return this.slots.filter(
      (slot) => slot.isEmpty()
    )
  }

  generateCard (slot) {
    slot.setCard(this.generator.create(slot))
  }
}

const slotRefillFactor = 0.0025

class CardGenerator {
  constructor (phaserState) {
    this.phaserState = phaserState
  }

  /**
  * create creates a card.
  */
  create(slot) {
    if (random.int(0, 5) == 0) {
      return new GoblinCard(this.phaserState, slot)
    }
    return this.generateBoardCard(slot)
  }

  generateBoardCard (slot) {
    var tileCount = random.int(2, 6)
    var positions = []
    for (var x = 0; x < 3; x++) {
      for (var y = 0; y < 3; y++) {
        positions.push({x, y})
      }
    }
    array.shuffle(positions)
    positions = positions.slice(0, tileCount)
    var minima = positions.reduce(
      (acc, curr) => ({ x: Math.min(acc.x, curr.x), y: Math.min(acc.y, curr.y)}),
      { x: 2, y: 2}
    )
    positions = positions.map(
      (position) => ({ x: position.x - minima.x, y: position.y - minima.y})
    )
    var maxima = positions.reduce(
      (acc, curr) => ({ x: Math.max(acc.x, curr.x), y: Math.max(acc.y, curr.y)}),
      { x: 0, y: 0}
    )
    var tiles = positions.map(
      (position) => new BoardCardTile(this.phaserState, slot, Math.random() > 0.5 ? 'path' : 'rock', position, maxima)
    )
    return new BoardCard(this.phaserState, slot, tiles)
  }
}

class CardSlot {
  constructor (state, cards, index) {
    this.cards = cards
    this.phaserState = state
    this.index = index
    this.bg = state.add.sprite(this.x(), this.y(), "ui_card")
    this.state = "inactive"
    this.effect = state.add.sprite(this.x(), this.y(), "ui_cardfx")
    this.effect.animations.add("inactive", [0], 1, false)
    this.effect.animations.add("hover", [1,2,3], 10, true)
    this.effect.animations.add("active", [4,5,6], 10, true)
    this.inputFrame = this.effect
    this.inputFrame.inputEnabled = true
    this.inputFrame.events.onInputOver.add((obj, ptr) => this.over(obj, ptr))
    this.inputFrame.events.onInputOut.add((obj, ptr) => this.out(obj, ptr))
    this.inputFrame.events.onInputUp.add((obj, ptr, stillOver) => this.up(obj, ptr, stillOver))
    this.nextCardWaitTime = 0
  }

  refill (amount) {
    this.nextCardWaitTime -= amount
    if (this.nextCardWaitTime <= 0) {
      this.cards.generateCard(this)
    }
  }

  setCard(card) {
    this.card = card
    this.bg.frame = 1
  }

  isEmpty() {
    return !this.card
  }

  update () {
    this.inputFrame.bringToTop()
  }

  over (obj, ptr) {
    if (this.isInactive() && this.card) {
      this.setState("hover")
    }
  }

  out (obj, ptr) {
    if (this.isHovered()) {
      this.setState("inactive")
    }
  }

  up (obj, ptr, stillOver) {
    if (!stillOver) {
      return
    }
    if (!this.card) {
      return
    }
    if (this.isActive()) {
      this.setState("inactive")
      this.cards.deactivate()
    } else if (this.isHovered()) {
      this.cards.deselectAll()
      this.setState("active")
    }
  }

  setState (state) {
    this.state = state
    this.effect.animations.play(state)
    if (state == "active") {
      this.cards.activate(this)
    }
  }

  isInactive() {
    return this.state == "inactive"
  }

  isHovered() {
    return this.state == "hover"
  }

  isActive() {
    return this.state == "active"
  }

  x () {
    return board.tileSize.width * board.size.width * this.index / maxCards + 20
  }

  y () {
    return 224
  }

  getUseOverlay (state, position) {
    return this.card.getUseOverlay(state, position)
  }

  use (state, position) {
    this.card.use(state, position)
  }

  removeCard() {
    this.cards.deactivate()
    this.setState("inactive")
    this.card.destroy()
    this.card = null
    this.bg.frame = 0
    this.nextCardWaitTime = 1
  }
}

class Card {
  constructor (slot) {
    this.slot = slot
    this.sprites = []
  }

  addToSprites (sprites) {
    sprites.forEach(
      (sprite) => this.sprites.push(sprite)
    )
  }

  use (state, position) {
    this.slot.removeCard()
  }

  destroy() {
    this.sprites.forEach(
      (sprite) => {
        sprite.destroy()
      }
    )
  }
}

class BoardCard extends Card {
  constructor (state, slot, boardCardTiles) {
    super(slot)
    this.tiles = boardCardTiles
    this.addToSprites(boardCardTiles.map((tile) => tile.tile))
  }

  getUseOverlay (state, position) {
    var offsets = new Offsets()
    this.tiles.forEach(
      (tile) => {
        const boardPosition = v.add(tile.offset, position)
        offsets.add(
          boardPosition.x,
          boardPosition.y,
          state.board.inside(boardPosition.x, boardPosition.y) && state.board.getTile(boardPosition.x, boardPosition.y).isUnset()
        )
      }
    )
    return offsets
  }

  use (state, position) {
    this.tiles.forEach(
      (tile) => {
        var tilePosition = v.add(position, tile.offset)
        state.board.setTile(tilePosition.x, tilePosition.y, tile.tile.key)
      }
    )
    super.use(state, position)
  }
}

class BoardCardTile {
  constructor (state, slot, type, offset, maxOffset) {
    this.offset = offset
    var x = slot.x() + board.tileSize.width * (offset.x - maxOffset.x / 2) + 20
    var y = slot.y() + board.tileSize.height * (offset.y - maxOffset.y / 2) + 24
    this.tile = state.add.sprite(x, y, "tile_" + type)
  }
}

class GoblinCard extends Card {
  constructor (state, slot) {
    super(slot)
    this.cardSymbol = state.add.sprite(slot.x(), slot.y(), "ui_card_goblin")
    this.addToSprites([this.cardSymbol])
  }

  getUseOverlay (state, position) {
    const offsets = new Offsets()
    offsets.add(
      position.x,
      position.y,
      state.board.inside(position.x, position.y) && state.board.getTile(position.x, position.y).isPassable()
    )
    return offsets
  }

  use (state, position) {
    const pos = state.board.position(position.x, position.y)
    const goblin = state.monsterGroups['goblins'].create(pos.x, pos.y, "sprite_monster_goblin")
    goblin.setTarget(position)
    goblin.setState(state)
    super.use(state, position)
  }
}

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

class Offsets {
  constructor () {
    this.offsets = []
    this.valid = true
  }

  add (x, y, valid) {
    this.offsets.push({ x, y, valid })
    this.valid = this.valid && valid
  }

  areAllValid() {
    return this.valid
  }
}

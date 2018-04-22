import array from './array'
import random from './random'
import v from './vector'

import board from './play/board'
import hero from './play/hero'
import life from './play/life'
import monsters from './play/monsters'

class Play extends Phaser.State {
  create() {
    this.board = board.New(this, board.size, this.overlayClick.bind(this))
    this.party = new hero.Party(this, hero.maxHeroes)
    this.cards = new Cards(this)
    this.heart = new monsters.DungeonHeart(this)
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

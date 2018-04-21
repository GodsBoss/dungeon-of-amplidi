class Play extends Phaser.State {
  create() {
    this.board = new Board(this, boardSize, this.overlayClick.bind(this))
    this.party = new Party(this, maxHeroes)
    this.cards = new Cards(this)
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

// tileSize is the size of a single tile in pixels.
const tileSize = { width: 12, height: 12 }

// boardSize is the size of the board in tiles.
const boardSize = { width: 24, height: 16 }

// maxCards is the number of cards the player may have.
const maxCards = 5

// maxHeroes is the number of heroes the player has.
const maxHeroes = 4

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
}

class Tile extends Phaser.Sprite {
  constructor(game, x, y, key, frame) {
    super(game, x, y, key, frame)
  }

  isUnset () {
    return this.key == "tile_unset"
  }
}

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
    this.heroes = []
    this.position = { x: 1, y: boardSize.height / 2 }
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
      y: tileSize.height * boardSize.height * this.index / maxHeroes + 20
    }
  }

  renderHeroLifeValue () {
    this.heroLifeValue.width = 34 * this.life.percentage()
  }

  /**
  * Sets the hero position, this is a board position, not pixel coordinates.
  */
  setPosition (x, y) {
    this.heroSprite.x = x * tileSize.width + 20 - 6
    this.heroSprite.y = y * tileSize.height + 20 - 6
    this.position = { x, y }
  }

  update () {
    this.life.tick()
    this.move(this.party.position)
    this.renderHeroLifeValue()
  }

  move (target) {
    if(distance(this.position, target) > maximumHeroPartyDistance) {
      const d = diff(this.position, target)
      const l = length(d)
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
    return this.generateBoardCard(slot)
  }

  generateBoardCard (slot) {
    var tileCount = random(2, 6)
    var positions = []
    for (var x = 0; x < 3; x++) {
      for (var y = 0; y < 3; y++) {
        positions.push({x, y})
      }
    }
    shuffle(positions)
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
    return tileSize.width * boardSize.width * this.index / maxCards + 20
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
        const boardPosition = add(tile.offset, position)
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
        var tilePosition = add(position, tile.offset)
        state.board.setTile(tilePosition.x, tilePosition.y, tile.tile.key)
      }
    )
    super.use(state, position)
  }
}

class BoardCardTile {
  constructor (state, slot, type, offset, maxOffset) {
    this.offset = offset
    var x = slot.x() + tileSize.width * (offset.x - maxOffset.x / 2) + 20
    var y = slot.y() + tileSize.height * (offset.y - maxOffset.y / 2) + 24
    this.tile = state.add.sprite(x, y, "tile_" + type)
  }
}

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

function distance(p1, p2) {
  return length(diff(p1, p2))
}

function add(p1, p2) {
  return {
    x: p1.x + p2.x,
    y: p1.y + p2.y
  }
}

function diff(p1, p2) {
  return {
    x: p2.x - p1.x,
    y: p2.y - p1.y
  }
}

function length(p) {
  return Math.sqrt(p.x*p.x, p.y*p.y)
}

function shuffle(arr) {
  if (arr.length < 2) {
    return
  }
  for (let i=0; i<Math.pow(arr.length, 2); i++) {
    var index1 = random(0, arr.length - 1)
    var index2 = random(0, arr.length - 1)
    var val1 = arr[index1]
    arr[index1] = arr[index2]
    arr[index2] = val1
  }
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

class Play extends Phaser.State {
  create() {
    this.board = new Board(this, boardSize)
    this.party = new Party(this, maxHeroes)
    this.cards = new Cards(this)
  }

  update() {
    this.party.update()
    this.cards.update()
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
    this.slots = []
    for(var i = 0; i < maxCards; i++) {
      this.slots[i] = new CardSlot(state, this, i)
      this.slots[i].setCard(new BoardCard(state, this.slots[i]))
    }
  }

  update() {
    this.slots.forEach(
      (slot) => slot.update()
    )
  }

  deselectAll() {
    this.slots.forEach(
      (slot) => slot.setState("inactive")
    )
  }
}

class CardSlot {
  constructor (state, cards, index) {
    this.cards = cards
    this.phaserState = state
    this.index = index
    this.bg = state.add.sprite(this.x(), this.y(), "ui_card")
    this.inputFrame = state.add.sprite(this.x(), this.y(), "ui_invisiblecard")
    this.inputFrame.inputEnabled = true
    this.inputFrame.events.onInputOver.add((obj, ptr) => this.over(obj, ptr))
    this.inputFrame.events.onInputOut.add((obj, ptr) => this.out(obj, ptr))
    this.inputFrame.events.onInputUp.add((obj, ptr, stillOver) => this.up(obj, ptr, stillOver))
    this.state = "inactive"
    this.effect = state.add.sprite(this.x(), this.y(), "ui_cardfx")
    this.effect.animations.add("inactive", [0], 1, false)
    this.effect.animations.add("hover", [1,2,3], 10, true)
    this.effect.animations.add("active", [4,5,6], 10, true)
  }

  setCard(card) {
    this.card = card
  }

  update () {
    this.inputFrame.bringToTop()
  }

  over (obj, ptr) {
    if (this.isInactive()) {
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
    if (this.isActive()) {
      this.setState("inactive")
    } else if (this.isHovered()) {
      this.cards.deselectAll()
      this.setState("active")
    }
  }

  setState (state) {
    this.state = state
    this.effect.animations.play(state)
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
}

class Card {
  constructor (slot) {
    this.slot = slot
  }
}

class BoardCard extends Card {
  constructor (state, slot) {
    super(slot)
    var maxOffsets = { x: 1, y: 1 }
    this.tiles = [
      new BoardCardTile(state, slot, Math.random() > 0.5 ? 'path' : 'rock', { x: 0, y: 0}, maxOffsets),
      new BoardCardTile(state, slot, Math.random() > 0.5 ? 'path' : 'rock', { x: 1, y: 0}, maxOffsets),
      new BoardCardTile(state, slot, Math.random() > 0.5 ? 'path' : 'rock', { x: 0, y: 1}, maxOffsets),
      new BoardCardTile(state, slot, Math.random() > 0.5 ? 'path' : 'rock', { x: 1, y: 1}, maxOffsets)
    ]
  }
}

class BoardCardTile {
  constructor (state, slot, type, tileOffset, maxOffset) {
    var x = slot.x() + tileSize.width * (tileOffset.x - maxOffset.x / 2) + 20
    var y = slot.y() + tileSize.height * (tileOffset.y - maxOffset.y / 2) + 24
    this.tile = state.add.sprite(x, y, "tile_" + type)
  }
}

function distance(p1, p2) {
  return length(diff(p1, p2))
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

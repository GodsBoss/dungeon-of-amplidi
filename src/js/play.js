import array from './array'
import random from './random'
import v from './vector'

import board from './play/board'
import cards from './play/cards'
import hero from './play/hero'
import monsters from './play/monsters'

class Play extends Phaser.State {
  create() {
    this.board = board.New(this, board.size, this.overlayClick.bind(this))
    this.party = new hero.Party(this, hero.maxHeroes)
    this.cards = cards.New(this)
    this.monsterGroups = new monsters.Groups()
    this.monsterGroups.add(
      "goblin",
      new monsters.Group(
        this,
        (state, group, position) => new monsters.Goblin(state, group, position)
      )
    )
    this.monsterGroups.add(
      "heart",
      new monsters.Group(
        this,
        (state, group, position) => new monsters.DungeonHeart(state, group, position)
      )
    )
    this.monsterGroups.createMonster('heart', { x: board.size.width-2, y: Math.floor(board.size.height / 2) - 1 })
  }

  update() {
    this.party.update()
    this.cards.update()
    this.monsterGroups.update()
    this.board.overlay(this.cards.getUseOverlay(this, this.board.fromPointer(this.input)))
  }

  overlayClick (obj, ptr, stillOver) {
    this.cards.useCard(this, this.board.fromPointer(this.input))
  }
}

export default { State: Play }

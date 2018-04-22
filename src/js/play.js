import array from './array'
import random from './random'
import v from './vector'

import board from './play/board'
import cards from './play/cards'
import hero from './play/hero'
import life from './play/life'
import monsters from './play/monsters'

class Play extends Phaser.State {
  create() {
    this.board = board.New(this, board.size, this.overlayClick.bind(this))
    this.party = new hero.Party(this, hero.maxHeroes)
    this.cards = cards.New(this)
    this.heart = new monsters.DungeonHeart(this)
    this.monsterGroups = {
      "goblins": this.add.group()
    }
    this.monsterGroups['goblins'].classType = monsters.Goblin
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

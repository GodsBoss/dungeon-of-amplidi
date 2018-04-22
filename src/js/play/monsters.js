import behaviour from './behaviour'
import random from '../random'
import v from '../vector'

class Monster {
  /**
  * @param position is a grid position, not pixel coordinates.
  */
  constructor (group, position) {
    this.group = group
    this.currentPosition = position
  }

  setBehaviour(behaviour) {
    this.behaviour = behaviour
  }

  position () {
    return this.currentPosition
  }

  setPosition (position) {
    this.currentPosition = position
  }

  update() {}
}

class DungeonHeart extends Monster {
  constructor (state, group, position) {
    super(group, position)
    const coord = state.board.position(position.x, position.y)
    this.sprite = state.add.sprite(coord.x, coord.y, 'sprite_dungeonheart')
  }
}

class Goblin extends Monster {
  constructor (state, group, position) {
    super(group, position)
    this.setBehaviour(
      new behaviour.PursueTarget(
        this,
        behaviour.randomTarget(
          (entity, currentTarget) => state.board.findPassableTiles(currentTarget ? currentTarget : entity.position())
        )
      )
    )
    this.state = state
    const coords = this.state.board.position(position.x, position.y)
    this.sprite = state.add.sprite(coords.x, coords.y, 'sprite_monster_goblin')
  }

  update () {
    this.behaviour.behave()
    const coords = this.state.board.position(this.position().x, this.position().y)
    this.sprite.x = coords.x
    this.sprite.y = coords.y
  }

  speed () {
    return 0.025
  }
}

class Group {
  constructor (state, create) {
    this.state = state
    this.create = create
    this.monsters = []
  }

  /**
  * createMonster creates a monster and adds it to the group. Also returns it.
  *
  * @param position is a grid position, not pixel coordinates.
  */
  createMonster (position) {
    const monster = this.create(this.state, this, position)
    this.monsters.push(monster)
    return monster
  }

  update () {
    this.monsters.forEach(
      (monster) => monster.update()
    )
  }
}

class Groups {
  constructor () {
    this.list = []
    this.byName = {}
  }

  add (name, group) {
    this.list.push(group)
    this.byName[name] = group
  }

  getByName (name) {
    return this.byName[name]
  }

  createMonster (name, position) {
    this.getByName(name).createMonster(position)
  }

  update () {
    this.list.forEach(
      (group) => group.update()
    )
  }
}

export default {
  DungeonHeart,
  Goblin,
  Group,
  Groups
}

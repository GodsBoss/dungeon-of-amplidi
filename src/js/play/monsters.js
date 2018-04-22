import behaviour from './behaviour'
import life from './life'
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

  /**
  * experience is the amount of experience the party receives if the monster is killed.
  */
  experience() {
    return 0
  }
}

class DungeonHeart extends Monster {
  constructor (state, group, position) {
    super(group, position)
    this.state = state
    const coord = state.board.position(position.x, position.y)
    this.sprite = state.add.sprite(coord.x, coord.y, 'sprite_dungeonheart')
    this.life = life.New(1, 0.1)
  }

  update () {
    if (this.life.none()) {
      this.state.state.start("gameover", true, false, true)
    }
  }
}

class Goblin extends Monster {
  constructor (state, group, position) {
    super(group, position)
    this.setBehaviour(
      new behaviour.PursueTarget(
        behaviour.randomTarget(
          (entity, currentTarget) => state.board.findPassableTiles(currentTarget ? currentTarget : entity.position())
        )
      )
    )
    this.state = state
    const coords = this.state.board.position(position.x, position.y)
    this.sprite = state.add.sprite(coords.x, coords.y, 'sprite_monster_goblin')
    this.life = life.New(20)
  }

  update () {
    if (this.life.none()) {
      this.sprite.frame = 8
      return
    }
    this.behaviour.behave(this)
    const coords = this.state.board.position(this.position().x, this.position().y)
    this.sprite.x = coords.x
    this.sprite.y = coords.y
  }

  speed () {
    return 0.025
  }

  experience () {
    return 25
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

  empty () {
    return this.monsters.length == 0
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

  /**
  * allMonsters returns all monsters of all groups.
  */
  allMonsters () {
    return this.list.reduce(
      (list, group) => list.concat(group.monsters),
      []
    )
  }

  empty (type) {
    return this.getByName(type).empty()
  }
}

export default {
  DungeonHeart,
  Goblin,
  Group,
  Groups
}

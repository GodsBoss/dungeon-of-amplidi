import random from '../random'
import v from '../vector'

class Behaviour {
  constructor (entity) {
    this.entity = entity
  }
}

/**
* PursueTarget moves forward to reach the current target, and if reached, searches for a new target.
*/
class PursueTarget extends Behaviour {
  /**
  * Constructs the behaviour.
  *
  * @param entity is what uses the behaviour.
  *        Expose speed method which returns the entity's speed.
  *        Expose position method with returns the current position.
  *        Expose setPosition method with sets a new position.
  * @param nextTarget finds a target. It takes the entity as first parameter and the current target as the second.
  *        For the initial target it is called with null as the second parameter.
  */
  constructor (entity, nextTarget) {
    super(entity)
    this.nextTarget = nextTarget
    this.target = nextTarget(entity, null)
  }

  behave() {
    const speed = this.entity.speed()
    const position = this.entity.position()
    const distance = v.distance(position, this.target)
    if (distance < speed) {
      this.target = this.nextTarget(this.entity, this.target)
    } else {
      const d = v.diff(position, this.target)
      this.entity.setPosition(
        v.add(
          {
            x: speed * d.x / distance,
            y: speed * d.y / distance
          }
        )
      )
    }
  }
}

/**
* randomTarget takes a function which creates possible targets for an entity and
* returns a function which returns just one of them.
*/
function randomTarget(possibleTargets) {
  return (entity, oldTarget) => {
    const targets = possibleTargets(entity, oldTarget)
    if (targets.length > 0) {
      return targets[random.int(0, targets.length - 1)]
    }
  }
}

export default {
  PursueTarget,
  randomTarget
}

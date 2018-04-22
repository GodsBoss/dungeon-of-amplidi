import random from '../random'
import v from '../vector'

class Behaviour {
  constructor () {}

  /**
  * @param entity is what uses the behaviour.
  *        Expose speed method which returns the entity's speed.
  *        Expose position method with returns the current position.
  *        Expose setPosition method with sets a new position.
  */
  behave(entity) {}
}

/**
* PursueTarget moves forward to reach the current target, and if reached, searches for a new target.
*/
class PursueTarget extends Behaviour {
  /**
  * Constructs the behaviour.
  *
  * @param nextTarget finds a target. It takes the entity as first parameter and the current target as the second.
  *        For the initial target it is called with null as the second parameter.
  */
  constructor (nextTarget) {
    super()
    this.nextTarget = nextTarget
  }

  behave(entity) {
    if (!this.target) {
      this.target = this.nextTarget(entity, this.target)
      return
    }
    const speed = entity.speed()
    const position = entity.position()
    const distance = v.distance(position, this.target)
    if (distance < speed) {
      this.target = this.nextTarget(entity, this.target)
    } else {
      const d = v.diff(position, this.target)
      entity.setPosition(
        v.add(entity.position(), v.mul(d, speed/distance))
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

class Skill {
  /**
  * @param refill defines how fast a cooldown passes.
  */
  constructor (refill = 0) {
    this.level = 1
    this.cooldown = 0
    this.refill = refill
    this.duration = 0 // How long (as a percentage) skill takes to perform, although its effect happens immediately.
  }

  /**
  * Attempts to use the skill.
  */
  use (origin, state) {
    if (this.isReady() && this._use(origin, state)) {
      this.cooldown = 1
    }
  }

  /**
  * _use will be implemented by child classes. Readiness is already tested.
  *
  * @return boolean Wether skill was applied
  */
  _use (origin, state) {
    return false
  }

  inUse () {
    return this.cooldown >= 1 - this.duration
  }

  /**
  * update lets the cooldown pass.
  */
  update () {
    this.cooldown = Math.max(0, this.cooldown - this.refill)
  }

  /**
  * isReady checks wether this skill is ready, i.e. its cooldown has passed.
  */
  isReady () {
    return this.cooldown == 0
  }
}

class Heal extends Skill {
  constructor () {
    super(0.02)
    this.duration = 0.2
  }
}

class Attack extends Skill {
  constructor () {
    super(0.04)
    this.duration = 0.15
  }
}

export default {
  Attack,
  Heal,
  None: Skill
}

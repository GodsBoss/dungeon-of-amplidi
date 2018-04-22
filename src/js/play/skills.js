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
  *
  * @return boolean
  */
  use (origin, state) {
    if (this.isReady() && this._use(origin, state)) {
      this.cooldown = 1
      return true
    }
    return false
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

/**
* Heal heals a member of the party. Targets the most injured party member, percentage-wise.
*/
class Heal extends Skill {
  constructor () {
    super(0.01)
    this.duration = 0.2
  }

  _use (origin, state) {
    const possibleTargets = state.party.livingHeroes().filter(
      (hero) => hero.life.missing() > this.healing() || hero.life.percentage() <= 0.5
    )
    if (possibleTargets.length == 0) {
      return false
    }
    const target = possibleTargets.sort((hero1, hero2) => hero1.life.percentage() - hero2.life.percentage())[0]
    target.life.gain(this.healing())
    return true
  }

  /**
  * healing returns the amount of life healed. Depends on the level.
  */
  healing () {
    return this.level * 20
  }
}

class Attack extends Skill {
  constructor () {
    super(0.02)
    this.duration = 0.15
  }
}

export default {
  Attack,
  Heal,
  None: Skill
}

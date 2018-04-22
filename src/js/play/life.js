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

  missing () {
    return this.maximum - this.current
  }
}

export default {
  New: (maximum, regeneration) => new Life(maximum, regeneration)
}

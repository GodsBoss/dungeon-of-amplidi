class Game {
  constructor (container) {
    this.phaserGame = new Phaser.Game(800, 600, Phaser.AUTO, container, null, false, false)
  }

  run() {}
}

export { Game }

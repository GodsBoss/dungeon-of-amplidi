import bootstrap from './bootstrap'
import levelselect from './levelselect'
import play from './play'
import preload from './preload'

class Game {
  constructor (container) {
    this.phaserGame = new Phaser.Game(800, 600, Phaser.AUTO, container, null, false, false)

    this.phaserGame.state.add("levelselect", new levelselect.State())
    this.phaserGame.state.add("play", new play.State())
    this.phaserGame.state.add("preload", new preload.State())

    // Add Bootstrap state and start game.
    this.phaserGame.state.add("bootstrap", new bootstrap.State(), true)
  }

  run() {}
}

export { Game }

/**
* Loads all assets, then moves on to title / level select.
*/
class Preload extends Phaser.State {
  preload() {}

  create() {
    this.state.start("levelselect")
  }
}

export { Preload as State }

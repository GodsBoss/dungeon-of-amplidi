/**
* First state to run, loads just enough to start preload state.
*/
class Bootstrap extends Phaser.State {
  preload() {}

  create() {
    this.state.start('preload');
  }
}

export { Bootstrap as State }

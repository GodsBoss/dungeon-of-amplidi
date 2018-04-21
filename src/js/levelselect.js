class LevelSelect extends Phaser.State {
  create() {
    this.state.start("play")
  }
}

export default { State: LevelSelect }

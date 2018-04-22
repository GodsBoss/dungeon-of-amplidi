class LevelSelect extends Phaser.State {
  create() {
    const bg = this.add.sprite(0, 0, "screen_levelselect")
    const startButton = this.add.sprite(170, 100, "ui_start_button")
    startButton.inputEnabled = true
    startButton.events.onInputUp.add(
      (button, ptr, stillOver) => {
        if (stillOver) {
          this.state.start("play")
        }
      }
    )
    startButton.events.onInputOver.add(
      () => startButton.frame = 1
    )
    startButton.events.onInputOut.add(
      () => startButton.frame = 0
    )
  }
}

export default { State: LevelSelect }

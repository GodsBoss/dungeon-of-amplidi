class GameOver extends Phaser.State {
  init (playerWon) {
    this.playerWon = playerWon
  }

  create () {
    const bg = this.add.sprite(0, 0, this.playerWon ? "screen_victory" : "screen_defeat")
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
      () => startButton.frame = 2
    )
    startButton.events.onInputOut.add(
      () => startButton.frame = 0
    )
  }
}

export default {
  State: GameOver
}

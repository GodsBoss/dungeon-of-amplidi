/**
* First state to run, loads just enough to start preload state.
*/
class Bootstrap extends Phaser.State {
  preload() {
    Phaser.Canvas.setImageRenderingCrisp(this.game.canvas); // For compatible browsers
    PIXI.scaleModes.DEFAULT = PIXI.scaleModes.NEAREST; // For WebGL
    // Phaser.Canvas.setSmoothingEnabled(this.game.context, false); // For 2D canvas
    this.game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
    this.game.scale.setUserScale(2, 2);
  }

  create() {
    this.state.start('preload');
  }
}

export default { State: Bootstrap }

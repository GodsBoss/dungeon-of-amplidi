/**
* Loads all assets, then moves on to title / level select.
*/
class Preload extends Phaser.State {
  preload() {
    [
      "screen_levelselect",
      "screen_play",
      "sprite_dungeonheart",
      "tile_path",
      "tile_rock",
      "tile_unset",
      "ui_card",
      "ui_heroframe",
      "ui_herolife",
      "ui_hero_cleric",
      "ui_hero_dead",
      "ui_hero_knight",
      "ui_hero_none"
    ].forEach(
      (key) => this.load.image(key, "gfx/" + key + ".png")
    )
  }

  create() {
    this.state.start("levelselect")
  }
}

export default { State: Preload }

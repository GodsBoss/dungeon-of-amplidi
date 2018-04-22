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
      "ui_card_goblin",
      "ui_card_pickaxe",
      "ui_heroframe",
      "ui_herolife",
      "ui_herolifevalue",
      "ui_hero_cleric",
      "ui_hero_dead",
      "ui_hero_knight",
      "ui_hero_none"
    ].forEach(
      (key) => this.load.image(key, "gfx/" + key + ".png")
    );

    [
      "sprite_hero_cleric",
      "sprite_hero_knight",
      "sprite_hero_none",
      "sprite_monster_goblin",
      "sprite_monster_guardian",
      "tile_overlay"
    ].forEach(
      (key) => this.load.spritesheet(key, "gfx/" + key + ".png", 12, 12)
    );

    [
      "ui_card",
      "ui_cardfx"
    ].forEach(
      (key) => this.load.spritesheet(key, "gfx/" + key + ".png", 50, 60)
    )
  }

  create() {
    this.state.start("levelselect")
  }
}

export default { State: Preload }

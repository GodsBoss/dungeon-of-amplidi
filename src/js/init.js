import { Game } from './game'

window.addEventListener(
  "load",
  (e) => {
    (new Game(document.body)).run()
  },
  false
)

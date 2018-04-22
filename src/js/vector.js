function distance(p1, p2) {
  return length(diff(p1, p2))
}

function add(p1, p2) {
  return {
    x: p1.x + p2.x,
    y: p1.y + p2.y
  }
}

function diff(p1, p2) {
  return {
    x: p2.x - p1.x,
    y: p2.y - p1.y
  }
}

function length(p) {
  return Math.sqrt(p.x*p.x, p.y*p.y)
}

export default {
  add,
  diff,
  distance,
  length
}
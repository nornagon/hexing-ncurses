const fs = require('fs')
const path = require('path')
const {Screen} = require('terminfo')

function readSlides() {
  const slide_dir = path.join(__dirname, 'slides')
  return fs.readdirSync(slide_dir).map(file => {
    const data = fs.readFileSync(path.join(slide_dir, file))
    if (file.endsWith('.json')) {
      const lines = JSON.parse(data.toString('utf8').replace(/^\ufeff/,''))
      const chars = []
      for (const line of lines) {
        for (const char of line) {
          if (char.character && (char.character !== " " || char.backgroundId !== "background")) {
            chars.push({
              x: char.point.x,
              y: char.point.y,
              chr: char.character,
              bg: char.backgroundId === 'background' ? null : char.backgroundId - 1,
              fg: char.foregroundId === 'foreground' ? null : char.foregroundId - 1,
            })
          }
        }
      }
      return () => {
        for (const c of chars) {
          screen.put(c.x, c.y, c.chr, {fg: c.fg, bg: c.bg})
        }
      }
    } else if (file.endsWith('.png')) {
      return () => {
        screen.putImage(0, 0, data)
      }
    } else {
      const chars = []
      const lines = data.toString('utf8').split('\n')
      for (let y = 0; y < lines.length; y++) {
        const line = lines[y]
        for (let x = 0; x < line.length; x++) {
          chars.push({x, y, chr: line[x]})
        }
      }
      return () => {
        for (const c of chars) {
          screen.put(c.x, c.y, c.chr, {fg: c.fg, bg: c.bg})
        }
      }
    }
  })
}

const slides = readSlides()

const screen = new Screen
screen.start()
screen.setCursorVisible(false)
screen.setMouseEnabled(true)
process.on('exit', () => { screen.stop() })

let slideIdx = 0

let particles = []

function draw() {
  screen.clear()
  slides[slideIdx]()
    /*
  for (const c of slides[slideIdx]) {
    screen.put(c.x, c.y, c.chr, {fg: c.fg, bg: c.bg})
  }
  */

  for (const p of particles) {
    screen.put(p.x, p.y, p.chr)
  }
}

function update() {
  const dt = 0.5
  const [width, height] = process.stdout.getWindowSize()
  for (const p of particles) {
    p.x += p.vx * dt
    p.y += p.vy * dt
    p.vy += 0.1 * dt
  }
  particles = particles.filter(p => p.x >= 0 && p.x < width && p.y >= 0 && p.y < height)
}

setInterval(() => {
  update()
  if (particles.length) {
    draw()
  }
}, 1000/30)

screen.on('key', (b) => {
  if (b[0] === 0x3) {
    process.exit()
  } else if (b.toString() === '\x1b[D') { // left
    slideIdx = Math.max(0, slideIdx - 1)
  } else if (b.toString() === '\x1b[C') { // right
    slideIdx = Math.min(slides.length - 1, slideIdx + 1)
  } else {
  }
  const m = /^\x1b\[M(.)(.)(.)$/.exec(b)
  if (m) {
    const [,,,btn, cx, cy] = b
    const x = cx - 32 - 1
    const y = cy - 32 - 1
    const btnsDown = btn & 0x23
    if (btnsDown === 32) {
      for (let i = 0; i < 4 + Math.random() * 5; i++)  {
        particles.push({
          x, y,
          vx: (Math.random() * 2 - 1) * 1.5,
          vy: Math.random() * 2 - 1,
          chr: '*'
        })
      }
    }
  }
  draw()
})
draw()

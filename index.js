const fs = require('fs')
const path = require('path')
const {Screen} = require('terminfo')

function readSlides() {
  const slide_dir = path.join(__dirname, 'slides')
  return fs.readdirSync(slide_dir).map(file => fs.readFileSync(path.join(slide_dir, file)).toString())
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
  const lines = slides[slideIdx].split(/\n/)
  for (let y = 0; y < lines.length; y++) {
    if (lines[y].length)
      screen.put(0, y, lines[y])
  }

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

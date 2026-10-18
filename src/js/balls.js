import { getFrame } from './cameraEffect.js'

const COUNT = 13
const COLORS = ['#80e1d2', '#fffaed']
const BALL_ALPHA = 0.6

// 開始球動畫，回傳停止動畫的方法
export function startBalls(canvas) {
  const ctx = canvas.getContext('2d')
  const balls = makeBalls()
  let frame
  let lastTime = performance.now()

  resize(canvas)

  function loop(time) {
    const step = Math.min((time - lastTime) / 16.67, 2)
    lastTime = time

    move(balls, canvas.width, canvas.height, step)
    paint(ctx, balls)
    frame = requestAnimationFrame(loop)
  }

  const onResize = () => resize(canvas)
  window.addEventListener('resize', onResize)
  frame = requestAnimationFrame(loop)

  return () => {
    cancelAnimationFrame(frame)
    window.removeEventListener('resize', onResize)
  }
}

function resize(canvas) {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

function makeBalls() {
  return Array.from({ length: COUNT }, (_, index) => {
    const radius = 20 + Math.random() * 20
    const frame = getFrame(window.innerWidth, window.innerHeight)
    const position = outside(frame, radius)

    return {
      x: position.x,
      y: position.y,
      radius,
      vx: random(-5, 5),
      vy: random(-5, 5),
      color: COLORS[index % COLORS.length],
      squash: 0,
    }
  })
}

function move(balls, width, height, step) {
  const frame = getFrame(width, height)

  balls.forEach((ball) => {
    ball.x += ball.vx * step
    ball.y += ball.vy * step
    ball.squash *= 0.82

    wall(ball, width, height, frame)
  })

  for (let first = 0; first < balls.length; first++) {
    for (let second = first + 1; second < balls.length; second++) {
      hit(balls[first], balls[second])
    }
  }
}

// 撞到最外層 Canvas 或魚眼內框就反彈。
function wall(ball, width, height, frame) {
  if (ball.x - ball.radius < 0) {
    ball.x = ball.radius
    ball.vx = Math.abs(ball.vx)
    ball.squash = 1
  } else if (ball.x + ball.radius > width) {
    ball.x = width - ball.radius
    ball.vx = -Math.abs(ball.vx)
    ball.squash = 1
  }

  if (ball.y - ball.radius < 0) {
    ball.y = ball.radius
    ball.vy = Math.abs(ball.vy)
    ball.squash = 1
  } else if (ball.y + ball.radius > height) {
    ball.y = height - ball.radius
    ball.vy = -Math.abs(ball.vy)
    ball.squash = 1
  }

  const dx = ball.x - frame.x
  const dy = ball.y - frame.y
  const distance = (dx * dx) / ((frame.rx + ball.radius) ** 2) +
    (dy * dy) / ((frame.ry + ball.radius) ** 2)

  if (distance >= 1) return

  const scale = 1 / Math.sqrt(distance)
  ball.x = frame.x + dx * scale
  ball.y = frame.y + dy * scale

  const nx = dx / (frame.rx * frame.rx)
  const ny = dy / (frame.ry * frame.ry)
  const length = Math.sqrt(nx * nx + ny * ny) || 1
  const normalX = nx / length
  const normalY = ny / length

  const speed = ball.vx * normalX + ball.vy * normalY
  if (speed < 0) {
    ball.vx -= 2 * speed * normalX
    ball.vy -= 2 * speed * normalY
  }
  ball.squash = 1
}

// 球重疊時，先分開，再交換碰撞方向
function hit(first, second) {
  let dx = second.x - first.x
  let dy = second.y - first.y
  let distance = Math.sqrt(dx * dx + dy * dy)

  if (distance >= first.radius + second.radius) return

  if (distance === 0) {
    dx = 1
    dy = 0
    distance = 1
  }

  const nx = dx / distance
  const ny = dy / distance
  const push = (first.radius + second.radius - distance) / 2

  first.x -= nx * push
  first.y -= ny * push
  second.x += nx * push
  second.y += ny * push

  const firstSpeed = first.vx * nx + first.vy * ny
  const secondSpeed = second.vx * nx + second.vy * ny

  // 已經分開就不再次施力
  if (firstSpeed <= secondSpeed) return

  first.vx += (secondSpeed - firstSpeed) * nx
  first.vy += (secondSpeed - firstSpeed) * ny
  second.vx += (firstSpeed - secondSpeed) * nx
  second.vy += (firstSpeed - secondSpeed) * ny
  first.squash = 1
  second.squash = 1
}

function paint(ctx, balls) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

  balls.forEach((ball) => {
    const wide = 1 + ball.squash * 0.2
    const tall = 1 - ball.squash * 0.2

    ctx.save()
    ctx.translate(ball.x, ball.y)
    ctx.scale(wide, tall)
    ctx.beginPath()
    ctx.globalAlpha = BALL_ALPHA
    ctx.fillStyle = ball.color
    ctx.arc(0, 0, ball.radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  })
}

function random(min, max) {
  return min + Math.random() * (max - min)
}

function outside(frame, radius) {
  let x
  let y

  do {
    x = random(radius, window.innerWidth - radius)
    y = random(radius, window.innerHeight - radius)
  } while (
    ((x - frame.x) ** 2) / ((frame.rx + radius) ** 2) +
    ((y - frame.y) ** 2) / ((frame.ry + radius) ** 2) < 1
  )

  return { x, y }
}

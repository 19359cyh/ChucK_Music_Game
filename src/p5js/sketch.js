
import p5 from 'p5'
import { Ball } from './ball.js'
import { Grid } from './grid.js'
import { updateControls } from '../js/music.js'


export function createSketch(container, videoElement) {

  const ml5 = window.ml5 || null;
  if(!ml5) {
    console.warn('ML5 library is not loaded. Hand tracking will not work.');
  } 

  return new p5((p) => {
    const balls = []
    const grids = []
    let hands = []
    let trackingStarted = false
    let noHandsWarningShown = false

    const setBallPosition = (ball, x, y) => {
      if (x == null || y == null) return
      const sourceWidth = videoElement?.videoWidth || p.width
      const sourceHeight = videoElement?.videoHeight || p.height
      //ball.updateBall((x / sourceWidth) * p.width, (y / sourceHeight) * p.height, ball.r)
      ball.updateBall(p.mouseX, p.mouseY, ball.r)
    }

    const gotHands = (results, error) => {
      if (error) {
        console.warn('ML5 手部推論失敗。', error)
        return
      }
      hands = Array.isArray(results) ? results : []
    }

    p.setup = async () => {
      p.createCanvas(container.clientWidth, container.clientHeight).parent(container)
      p.colorMode(p.RGB)
      grids.push(new Grid(p, 10))
      balls.push(new Ball(p, 100))
      for (let i = 1; i < 10; i++) {
        balls.push(new Ball(p, 100))

      }
      

      if (window.ml5 && videoElement) {
        try {
          if (videoElement.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
            await new Promise((resolve) => {
              videoElement.addEventListener('loadeddata', resolve, { once: true })
            })
          }

          const handPose = await window.ml5.handPose({ flipped: true })
          handPose.detectStart(videoElement, gotHands)
          trackingStarted = true

        } catch (error) {
          console.warn('ML5 手部追蹤無法啟用，改用滑鼠控制。', error)
        }
      }
    }

    p.draw = () => {
      p.clear()

      const horizontalPosition = p.constrain(p.mouseX / p.width, 0, 1)
      const verticalPosition = p.constrain(p.mouseY / p.height, 0, 1)
      const filterFrequency = p.map(horizontalPosition, 0, 1, 150, 6000)
      const pitchMultiplier = p.pow(2, p.map(verticalPosition, 0, 1, 1, -1))
      updateControls(filterFrequency, pitchMultiplier)

      if (trackingStarted && hands.length === 0 && !noHandsWarningShown && p.frameCount > 300) {
        console.warn('手部模型已啟動，但目前沒有偵測到手。請確認手部在攝影機畫面內。')
        noHandsWarningShown = true
      }
      
      /*
      if (hands.length > 0) {
        for (const hand of hands) {
          if (hand.confidence <= 0.1) continue
          const indexTip = hand.keypoints[8]
          const ballIndex = hand.handedness === 'Left' ? 0 : 1
          setBallPosition(balls[ballIndex], indexTip.x, indexTip.y)
        }
      } else {
        setBallPosition(balls[0], p.mouseX, p.mouseY)
        p.text(p.mouseX +", " + p.mouseY, 10, 20)
        //setBallPosition(balls[1], p.width - p.mouseX, p.height - p.mouseY)
      }
      */

      //setBallPosition(balls[0], p.mouseX, p.mouseY)
      balls[0].updateBall(p.mouseX, p.mouseY, balls[0].r)
      balls[0].drawBall()
      p.text(p.mouseX +", " + p.mouseY, 10, 20)
      for(let i = 1; i < balls.length; i++) {
        balls[i].updaterandomBall()
      }

      for (const grid of grids) {
        grid.updateGrid(balls, 0)
        grid.drawShape(0, 255, 255, 1)
      }
    }

    p.windowResized = () => {
      p.resizeCanvas(container.clientWidth, container.clientHeight)
    }
  })
}

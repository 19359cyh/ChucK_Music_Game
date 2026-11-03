import { useEffect, useRef, useState } from 'react'
import './App.css'
import { draw } from './js/cameraEffect.js'
import { startBalls } from './js/balls.js'
import { createSketch } from './p5js/sketch.js'

function App() {
  const videoRef = useRef(null)
  const ballsRef = useRef(null)
  const canvasRef = useRef(null)
  const sketchRef = useRef(null)
  const [cameraError, setCameraError] = useState('')

  useEffect(() => {
    const stopBalls = startBalls(ballsRef.current)
    let sketch
    let stream
    let animationFrame
    let sourceCanvas
    let sourceContext
    let outputContext
    let pointerX = 0
    let pointerY = 0
    let lastEffectTime = 0
    let effectFps = 0

    const updatePointer = (event) => {
      pointerX = event.clientX
      pointerY = event.clientY
    }

    window.addEventListener('pointermove', updatePointer)
    

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()

          const video = videoRef.current
          sketch = createSketch(sketchRef.current, video)
          const canvas = canvasRef.current
          const width = Math.min(video.videoWidth, 480)
          const height = Math.round(width * video.videoHeight / video.videoWidth)

          sourceCanvas = document.createElement('canvas')
          sourceCanvas.width = width
          sourceCanvas.height = height
          sourceContext = sourceCanvas.getContext('2d', {
            willReadFrequently: true,
          })
          outputContext = canvas.getContext('2d', {
            willReadFrequently: true,
          })
          canvas.width = width
          canvas.height = height

          let lastRenderTime = 0
          const render = (time) => {
            if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
              if (time - lastRenderTime >= 33) {
                if (lastEffectTime > 0) {
                  effectFps = 1000 / (time - lastEffectTime)
                }
                lastEffectTime = time
                const horizontalPosition = Math.min(
                  1,
                  Math.max(0, pointerX / window.innerWidth),
                )
                const verticalPosition = Math.min(
                  1,
                  Math.max(0, pointerY / window.innerHeight),
                )
                draw(video, sourceContext, outputContext, width, height, {
                  mouseX: pointerX,
                  mouseY: pointerY,
                  filterFrequency: 150 + horizontalPosition * 5850,
                  pitchMultiplier: 2 ** (1 - verticalPosition * 2),
                  fps: effectFps,
                })
                lastRenderTime = time
              }
            }
            
            animationFrame = requestAnimationFrame(render)
          }

          render(0)
        }
      } catch (error) {
        console.error('攝影機：', error)
        setCameraError('無法開攝影機，讓我用攝影機啊啊啊啊啊')
      }
    }

    void startCamera()

    return () => {
      stopBalls()
      sketch?.remove()
      cancelAnimationFrame(animationFrame)
      window.removeEventListener('pointermove', updatePointer)
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  return (
    <main className="camera-stage">
      <video ref={videoRef} autoPlay muted playsInline aria-hidden="true" />
      <canvas ref={ballsRef} aria-hidden="true" />
      <canvas ref={canvasRef} aria-label="魚眼畫面" />
      <div ref={sketchRef} className="p5-layer" aria-hidden="true" />
      {cameraError && <p role="alert">{cameraError}</p>}
    </main>
  )
}

export default App

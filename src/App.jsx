import { useEffect, useRef, useState } from 'react'
import './App.css'
import './js/music.js'
import { draw } from './js/cameraEffect.js'
import { startBalls } from './js/balls.js'

function App() {
  const videoRef = useRef(null)
  const ballsRef = useRef(null)
  const canvasRef = useRef(null)
  const [cameraError, setCameraError] = useState('')

  useEffect(() => {
    const stopBalls = startBalls(ballsRef.current)
    let stream
    let animationFrame
    let sourceCanvas
    let sourceContext
    let outputContext

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
          const canvas = canvasRef.current
          const width = Math.min(video.videoWidth, 960)
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

          const render = () => {
            if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
              draw(video, sourceContext, outputContext, width, height)
            }
            animationFrame = requestAnimationFrame(render)
          }

          render()
        }
      } catch (error) {
        console.error('攝影機：', error)
        setCameraError('無法開攝影機，讓我用攝影機啊啊啊啊啊')
      }
    }

    void startCamera()

    return () => {
      stopBalls()
      cancelAnimationFrame(animationFrame)
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  return (
    <main className="camera-stage">
      <video ref={videoRef} autoPlay muted playsInline aria-hidden="true" />
      <canvas ref={ballsRef} aria-hidden="true" />
      <canvas ref={canvasRef} aria-label="魚眼線條攝影機畫面" />
      {cameraError && <p role="alert">{cameraError}</p>}
    </main>
  )
}

export default App

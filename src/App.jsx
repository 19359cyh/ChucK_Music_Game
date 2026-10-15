import { useEffect, useRef, useState } from 'react'
import './App.css'
import './js/music.js'

function App() {
  const videoRef = useRef(null)
  const [cameraError, setCameraError] = useState('')

  useEffect(() => {
    let stream

    const startCamera = async () => {

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (error) {
        console.error('攝影機：', error)
        setCameraError('無法開攝影機，讓我用攝影機啊啊啊啊啊')
      }
    }

    void startCamera()

    return () => {
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  return (
    <main>
      <video ref={videoRef} autoPlay muted playsInline />
      {cameraError && <p role="alert">{cameraError}</p>}
    </main>

  );
}

export default App

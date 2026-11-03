import { Chuck } from 'webchuck'
import songDatabase from '../json/songs.json'
import adsrCode from '../chuck/adsr.ck?raw'
import playerCode from '../chuck/test.ck?raw'

const theChuck = await Chuck.init([])
let codeNumber = 0
let activeControlNames = null
let lastFilterFrequency = null
let lastPitchMultiplier = null
let musicStopped = false

const ckFiles = {
  'test.ck': playerCode,
}

function createSongCode(song) {
  const code = ckFiles[song.ck]

  if (!code) {
    throw new Error(`找不到CK：${song.ck}`)
  }

  if (!song.sound?.right || !song.sound?.left || !song.sound?.drum) {
    throw new Error(`歌曲 ${song.ck} 缺sound設定`)
  }

  const pan = song.pan
  if (
    !pan ||
    !['right', 'left', 'drum'].every(
      (channel) => Number.isFinite(pan[channel]) && pan[channel] >= 0 && pan[channel] <= 1,
    )
  ) {
    throw new Error(`歌曲 ${song.ck} pan設定問題`)
  }

  const classId = `${Date.now()}_${codeNumber++}`
  activeControlNames = {
    filter: `FILTER_FREQ_${classId}`,
    pitch: `PITCH_MULTIPLIER_${classId}`,
  }
  lastFilterFrequency = null
  lastPitchMultiplier = null
  const codeWithSound = `${adsrCode}

${code}`
    .replace(/\bViolin\b/g, `Violin_${classId}`)
    .replace(/\bBass\b/g, `Bass_${classId}`)
    .replace(/\bDrum\b/g, `Drum_${classId}`)
    .replace('__BPM__', String(song.bpm))
    .replace('__E_BEATS__', songDatabase.durations.E)
    .replace('__H_BEATS__', songDatabase.durations.H)
    .replace('__LOOP_BEATS__', String(song.loopBeats))
    .replace('__RIGHT_SOUND__', song.sound.right)
    .replace('__LEFT_SOUND__', song.sound.left)
    .replace('__DRUM_SOUND__', song.sound.drum)
    .replace('__RIGHT_PAN__', String(pan.right))
    .replace('__LEFT_PAN__', String(pan.left))
    .replace('__DRUM_PAN__', String(pan.drum))
    .replaceAll('__FILTER_FREQ__', activeControlNames.filter)
    .replaceAll('__PITCH_MULTIPLIER__', activeControlNames.pitch)

  if (codeWithSound.includes('__')) {
    throw new Error('ChucK 程式還有未替換的設定')
  }

  return codeWithSound
}

export function updateControls(filterFrequency, pitchMultiplier) {
  if (!activeControlNames) return

  try {
    if (
      lastFilterFrequency === null ||
      Math.abs(filterFrequency - lastFilterFrequency) >= 8
    ) {
      theChuck.setFloat(activeControlNames.filter, filterFrequency)
      lastFilterFrequency = filterFrequency
    }
    if (
      lastPitchMultiplier === null ||
      Math.abs(pitchMultiplier - lastPitchMultiplier) >= 0.01
    ) {
      theChuck.setFloat(activeControlNames.pitch, pitchMultiplier)
      lastPitchMultiplier = pitchMultiplier
    }
  } catch (error) {
    console.warn('無法更新 ChucK 音樂控制參數：', error)
  }
}

export function playSong(songNumber) {
  const song = songDatabase.songs[String(songNumber)]

  if (!song) {
    throw new Error(`找不到第 ${songNumber} 首歌`)
  }

  const result = theChuck.runCode(createSongCode(song))
  result.catch((error) => {
    console.error('ChucK 播放失敗：', error)
  })

  return result
}

void playSong(1)

export function stopMusic() {
  if (musicStopped) return

  musicStopped = true
  theChuck.clearChuckInstance()
  theChuck.disconnect()
  activeControlNames = null

  if (theChuck.context.state !== 'closed') {
    void theChuck.context.close().catch((error) => {
      console.warn('關閉 WebChucK 音訊引擎失敗：', error)
    })
  }
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    stopMusic()
  })
}

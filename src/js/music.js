import { Chuck } from 'webchuck'
import songDatabase from '../json/songs.json'
import adsrCode from '../chuck/adsr.ck?raw'
import playerCode from '../chuck/test.ck?raw'

const theChuck = await Chuck.init([])
let codeNumber = 0

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

  if (codeWithSound.includes('__')) {
    throw new Error('ChucK 程式還有未替換的設定')
  }

  return codeWithSound
}

export function playSong(songNumber) {
  const song = songDatabase.songs[String(songNumber)]

  if (!song) {
    throw new Error(`找不到第 ${songNumber} 首歌`)
  }

  const result = theChuck.runCode(createSongCode(song))

  if (result?.catch) {
    result.catch((error) => {
      console.error('ChucK 播放失敗：', error)
    })
  }

  return result
}

void playSong(1)

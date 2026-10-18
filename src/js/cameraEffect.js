// 魚眼 + 線條畫面效果
const FISHEYE_STRENGTH = 0.35
const EDGE_THRESHOLD = 65
const EDGE_GAIN = 5
const LINE_SIZE = 1
const LINE_COLOR = {
  red: 255,
  green: 139,
  blue: 77,
}

// 球會在這個框外
const FRAME = {
  width: 0.86,
  height: 1.2,
}

// 橢圓框
export function getFrame(width, height) {
  return {
    x: width / 2,
    y: height / 2,
    rx: width * FRAME.width / 2,
    ry: height * FRAME.height / 2,
  }
}

// 魚眼 + 線條效果的入口
export function draw(video, sourceContext, outputContext, width, height) {
  sourceContext.save()
  sourceContext.scale(-1, 1)
  sourceContext.drawImage(video, -width, 0, width, height)
  sourceContext.restore()

  const source = sourceContext.getImageData(0, 0, width, height)
  const fisheye = warp(source, width, height)
  const output = outputContext.createImageData(width, height)

  edge(fisheye, output, width, height)
  outputContext.putImageData(output, 0, 0)
}

// 數值越大，魚眼越強
function warp(source, width, height) {
  const fisheye = new Uint8ClampedArray(width * height)
  const centerX = width / 2
  const centerY = height / 2

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = (x - centerX) / centerX
      const dy = (y - centerY) / centerY
      const radius = Math.sqrt(dx * dx + dy * dy)
      const distortion = 1 + FISHEYE_STRENGTH * radius * radius
      const sourceX = Math.round(centerX + (x - centerX) * distortion)
      const sourceY = Math.round(centerY + (y - centerY) * distortion)
      const outputIndex = y * width + x

      if (
        sourceX < 0 ||
        sourceX >= width ||
        sourceY < 0 ||
        sourceY >= height
      ) {
        fisheye[outputIndex] = 0
        continue
      }

      const sourceIndex = (sourceY * width + sourceX) * 4
      fisheye[outputIndex] =
        source.data[sourceIndex] * 0.299 +
        source.data[sourceIndex + 1] * 0.587 +
        source.data[sourceIndex + 2] * 0.114
    }
  }

  return fisheye
}

// 只繪製變化明顯的地方
function edge(image, output, width, height) {
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const index = y * width + x
      const horizontal =
        -image[index - width - 1] - 2 * image[index - 1] -
        image[index + width - 1] +
        image[index - width + 1] + 2 * image[index + 1] +
        image[index + width + 1]
      const vertical =
        -image[index - width - 1] - 2 * image[index - width] -
        image[index - width + 1] +
        image[index + width - 1] + 2 * image[index + width] +
        image[index + width + 1]
      const strength = Math.abs(horizontal) + Math.abs(vertical)

      if (strength <= EDGE_THRESHOLD) continue

      const power = Math.min(1, strength / 255 * EDGE_GAIN)

      for (let dy = -LINE_SIZE + 1; dy < LINE_SIZE; dy++) {
        for (let dx = -LINE_SIZE + 1; dx < LINE_SIZE; dx++) {
          const px = x + dx
          const py = y + dy

          if (px < 0 || px >= width || py < 0 || py >= height) continue

          const outputIndex = (py * width + px) * 4
          output.data[outputIndex] = LINE_COLOR.red * power
          output.data[outputIndex + 1] = LINE_COLOR.green * power
          output.data[outputIndex + 2] = LINE_COLOR.blue * power
          output.data[outputIndex + 3] = 255
        }
      }
    }
  }
}

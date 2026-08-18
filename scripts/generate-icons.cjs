const fs = require('fs')
const zlib = require('zlib')

function crc32(buf) {
  let c = ~0
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i]
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1))
  }
  return ~c >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const td = Buffer.concat([Buffer.from(type), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(td))
  return Buffer.concat([len, td, crc])
}

function png(size, r, g, b) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8
  ihdr[9] = 2
  const rows = []
  for (let y = 0; y < size; y++) {
    const line = Buffer.alloc(1 + size * 3)
    for (let x = 0; x < size; x++) {
      const i = 1 + x * 3
      line[i] = r
      line[i + 1] = g
      line[i + 2] = b
    }
    rows.push(line)
  }
  const idat = zlib.deflateSync(Buffer.concat(rows))
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

fs.writeFileSync('public/icon-192.png', png(192, 59, 111, 212))
fs.writeFileSync('public/icon-512.png', png(512, 59, 111, 212))
fs.writeFileSync('public/icon-maskable.png', png(192, 59, 111, 212))
console.log('icons written')

import express from 'express'
import ytdl from '@distube/ytdl-core'
import cors from 'cors'

const app = express()
const PORT = 3001

app.use(cors())

/**
 * GET /api/download?v=VIDEO_ID&quality=360|480|720|1080&format=mp4|mp3
 */
app.get('/api/download', async (req, res) => {
  const { v: videoId, quality = '720', format = 'mp4' } = req.query

  if (!videoId) {
    return res.status(400).json({ error: 'Missing video ID (?v=...)' })
  }

  const url = `https://www.youtube.com/watch?v=${videoId}`

  try {
    const info = await ytdl.getInfo(url)
    const title = info.videoDetails.title.replace(/[^\w\s-]/g, '').trim()

    if (format === 'mp3') {
      // ── Audio Download ──────────────────────────────────
      res.setHeader('Content-Disposition', `attachment; filename="${title}.mp3"`)
      res.setHeader('Content-Type', 'audio/mpeg')

      ytdl(url, { quality: 'highestaudio' }).pipe(res)

    } else {
      // ── Video Download ──────────────────────────────────
      const targetHeight = parseInt(quality)

      // 1. Filter for formats with BOTH video and audio (pre-merged)
      const combinedFormats = info.formats.filter(f => f.hasVideo && f.hasAudio)

      // 2. Sort available formats by resolution (highest first)
      const sortedFormats = combinedFormats.sort((a, b) => (b.height || 0) - (a.height || 0))

      // 3. Find the best match:
      //    - Try to find one <= requested quality (e.g. if user asks 720p, give 720p if avail)
      //    - Fallback: give the highest available combined format (usually 720p or 360p)
      let chosenFormat = sortedFormats.find(f => (f.height || 0) <= targetHeight) || sortedFormats[0]

      if (!chosenFormat) {
        // Fallback if no combined MP4s found (rare)
        return res.status(404).json({ error: 'No suitable video format found' })
      }

      const actualQuality = chosenFormat.qualityLabel || `${chosenFormat.height}p`
      console.log(`  ↓ Downloading "${title}" at ${actualQuality} (itag: ${chosenFormat.itag})`)

      res.setHeader('Content-Disposition', `attachment; filename="${title} [${actualQuality}].mp4"`)
      res.setHeader('Content-Type', 'video/mp4')
      if (chosenFormat.contentLength) {
        res.setHeader('Content-Length', chosenFormat.contentLength)
      }

      ytdl(url, { format: chosenFormat }).pipe(res)
    }
  } catch (err) {
    console.error('Download error:', err.message)
    if (!res.headersSent) {
      res.status(500).json({ error: err.message || 'Download failed' })
    }
  }
})

app.listen(PORT, () => {
  console.log(`\n  🎬 Streamix download server running at http://localhost:${PORT}\n`)
})

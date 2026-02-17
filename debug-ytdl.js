import ytdl from '@distube/ytdl-core';
import fs from 'fs';

const videoId = 'dQw4w9WgXcQ'; // Rick Astley

async function checkFormats(id) {
  const url = `https://www.youtube.com/watch?v=${id}`;
  const log = [];
  log.push(`Checking formats for ${url}...`);
  
  try {
    const info = await ytdl.getInfo(url);
    const combinedFormats = info.formats.filter(f => f.hasVideo && f.hasAudio);
    
    log.push(`\nFound ${combinedFormats.length} combined formats:`);
    combinedFormats.forEach(f => {
      log.push(`- itag: ${f.itag}, Quality: ${f.qualityLabel}, Height: ${f.height}, Container: ${f.container}`);
    });

    log.push(`\nAll Formats (Video only):`);
     const videoOnly = info.formats.filter(f => f.hasVideo && !f.hasAudio);
     videoOnly.forEach(f => {
        log.push(`- itag: ${f.itag}, Quality: ${f.qualityLabel}, Height: ${f.height}, Container: ${f.container}`);
     });

    fs.writeFileSync('formats.txt', log.join('\n'));
    console.log('Done. Check formats.txt');

  } catch (error) {
    console.error('Error:', error.message);
    fs.writeFileSync('formats.txt', `Error: ${error.message}`);
  }
}

checkFormats(videoId);

const axios = require("axios")

const re = /(.*)-(.*)/
const multipleSingerRegex = /(.*),/

const getLyrics = async (title) => {
    let match = re.exec(title)
    let singer = match[1]
    let multipleSingerMatch = multipleSingerRegex.exec(singer)
    if (multipleSingerMatch) {
        singer = multipleSingerMatch[1]
    }
    let songName = match[2]
    let lyrics = "Sorry!! We're unable to get the data. :("
    try {
        let res = await axios.get(`https://api.lyrics.ovh/v1/${singer}/${songName}`)
        lyrics = res.data.lyrics
    }
    catch (e) {
        console.log("error while fetching lyrics")
        console.log(e)
    }
    return lyrics
}

module.exports = getLyrics
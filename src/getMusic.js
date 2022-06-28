const axios = require("axios")

let getMusic = async (songName, MUSIC_TOKEN, requestedBy) => {
    let songData = {}
    let parameters = {
        part: "snippet",
        q: songName + " audio",
        maxResults: 1,
        key: MUSIC_TOKEN
    }
    try {
        let searchSong = await axios.get(`https://www.googleapis.com/youtube/v3/search`, { params: parameters })
        let songInfo = searchSong.data.items[0]
        let songTitle = songInfo.snippet.title.replace(/&#39;/g, "'")
        songData = {
            id: songInfo.id.videoId,
            title: songTitle,
            authorChannel: songInfo.snippet.channelTitle,
            source: "YouTube",
            thumbnailHigh: songInfo.snippet.thumbnails.high.url,
            requestedBy: requestedBy
        }
    }
    catch (e) {
        console.log("error in requesting data")
        console.log(e)
    }
    return songData
}

module.exports = getMusic

const axios = require("axios")

let getMusic = async (songName, MUSIC_TOKEN) => {
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
        songData = {
            id: songInfo.id.videoId,
            title: songInfo.snippet.title,
            authorChannel: songInfo.snippet.channelTitle,
            source: "YouTube"
        }
    }
    catch (e) {
        console.log("error in requesting data")
        console.log(e)
    }
    return songData
}

module.exports = getMusic

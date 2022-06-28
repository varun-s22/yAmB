const { joinVoiceChannel, createAudioResource } = require("@discordjs/voice")
const ytdl = require("ytdl-core")

async function playMusic(newPlayer, playerData) {
    let songData = playerData.songs[0]
    let url = `https://www.youtube.com/watch?v=${songData.id}`
    const connection = await joinVoiceChannel({
        channelId: playerData.voiceChannel.id,
        guildId: playerData.guild.id,
        adapterCreator: playerData.adapter
    })
    playerData.connection = connection
    let resource = createAudioResource(ytdl(url, {
        filter: "audio",
        fmt: "mp3",
        highWaterMark: 1 << 62,
        liveBuffer: 1 << 62,
        dlChunkSize: 0, //disabling chunking is recommended in discord bot
        bitrate: 128,
        quality: "lowestaudio",
    }))
    try {
        await newPlayer.play(resource)
        await connection.subscribe(newPlayer)
    }
    catch (e) {
        console.log("error playing song")
        console.log(e)
    }
}

module.exports = playMusic
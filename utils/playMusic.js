const { joinVoiceChannel, createAudioResource } = require("@discordjs/voice")
const ytdl = require("ytdl-core")
const getMusic = require("../src/getMusic")

async function playMusic(msg, newPlayer, nameByUser, MUSIC_TOKEN) {
    let songData = await getMusic(nameByUser, MUSIC_TOKEN)
    if (!songData) {
        console.log("can't play song")
        return false
    }
    let url = `https://www.youtube.com/watch?v=${songData.id}`
    const connection = await joinVoiceChannel({
        channelId: msg.member.voice.channel.id,
        guildId: msg.member.guild.id,
        adapterCreator: msg.member.guild.voiceAdapterCreator
    })
    try {
        let resource = createAudioResource(ytdl(url, {
            filter: "audioonly"
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
    catch (e) {
        console.log("error while downloading song")
        console.log(e)
    }
    return songData
}

module.exports = playMusic
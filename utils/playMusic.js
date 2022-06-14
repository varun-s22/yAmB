const { joinVoiceChannel, createAudioResource } = require("@discordjs/voice")
const ytdl = require("ytdl-core")
const getMusic = require("../src/getMusic")

async function playMusic(msg, newPlayer, nameByUser, MUSIC_TOKEN) {
    let songData = await getMusic(nameByUser, MUSIC_TOKEN)
    let url = `https://www.youtube.com/watch?v=${songData.id}`
    const connection = await joinVoiceChannel({
        channelId: msg.member.voice.channel.id,
        guildId: msg.member.guild.id,
        adapterCreator: msg.member.guild.voiceAdapterCreator
    })
    let resource = createAudioResource(ytdl(url, {
        filter: "audioonly"
    }))
    await newPlayer.play(resource)
    await connection.subscribe(newPlayer)
    return songData
}

module.exports = playMusic
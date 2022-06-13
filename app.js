const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require("@discordjs/voice")
const { Client, Intents } = require("discord.js")
const ytdl = require("ytdl-core")
const fs = require("fs")
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_MESSAGES,
    ]
})

const defaultPrefix = "~"
require("dotenv").config()
const TOKEN = process.env.DISCORD_TOKEN

function isMsgForBot(msg) {
    if (!msg.content.startsWith(defaultPrefix)) return false
    let msgArray = msg.content.split(" ")
    if (msgArray[0] === "~") return false
    return true
}

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}`)
})

client.on("messageCreate", async (msg) => {
    if (isMsgForBot(msg)) {
        let command = msg.content.slice(1)
        if (command === "ping")
            await msg.reply("pong!")
        if (command === "play") {
            let url = "https://www.youtube.com/watch?v=V54CEElTF_U"
            const connection = await joinVoiceChannel({
                channelId: msg.member.voice.channel.id,
                guildId: msg.member.guild.id,
                adapterCreator: msg.member.guild.voiceAdapterCreator
            })
            let newPlayer = createAudioPlayer()
            let resource = createAudioResource(ytdl(url, {
                filter: "audioonly"
            }))
            await newPlayer.play(resource)
            await connection.subscribe(newPlayer)
        }
    }
})
client.login(TOKEN)
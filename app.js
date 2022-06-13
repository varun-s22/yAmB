const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require("@discordjs/voice")
const { Client, Intents } = require("discord.js")
const ytdl = require("ytdl-core")
const getMusic = require("./src/getMusic")
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
const MUSIC_TOKEN = process.env.YOUTUBE_KEY


function isMsgForBot(msg) {
    if (!msg.content.startsWith(defaultPrefix) || msg.author.bot) return false
    let msgArray = msg.content.split(" ")
    if (msgArray[0] === "~") return false
    return true
}

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}`)
})

client.on("messageCreate", async (msg) => {
    if (isMsgForBot(msg)) {
        const args = msg.content.slice(defaultPrefix.length).trim().split(' ');
        const command = args.shift().toLowerCase();
        if (command === "ping" && args.length === 0)
            await msg.reply("pong!")
        else if (command === "play") {
            if (args.length === 0) {
                await msg.channel.send("Please pass the arguments")
                return
            }
            let nameByUser = args.join(" ")
            try {
                let songData = await getMusic(nameByUser, MUSIC_TOKEN)
                let url = `https://www.youtube.com/watch?v=${songData.id}`
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
            catch (e) {
                console.log("error in recieving data")
                console.log(e)
            }
        }
        else {
            let textChannel = msg.channel
            await textChannel.send("Unknown command")
        }
    }
})
client.login(TOKEN)
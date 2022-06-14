const { Client, Intents } = require("discord.js")
const { createAudioPlayer, AudioPlayerStatus } = require("@discordjs/voice")
const playMusic = require("./utils/playMusic")
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
let isPlaying = false
let isPaused = false
const player = createAudioPlayer()


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
        const args = msg.content.slice(defaultPrefix.length).trim().split(' ')
        const command = args.shift().toLowerCase()
        if (command === "ping" && args.length === 0)
            await msg.reply("pong!")
        else if (command === "play") {
            if (args.length === 0) {
                await msg.channel.send("Please pass the arguments")
                return
            }
            let nameByUser = args.join(" ")
            try {
                let songData = await playMusic(msg, player, nameByUser, MUSIC_TOKEN)
                await msg.channel.send(`now playing: ${songData.title}`)
                isPlaying = true
            }
            catch (e) {
                console.log("error in recieving data")
                console.log(e)
            }
        }
        else if (command === "pause") {
            if (!isPlaying) {
                await msg.channel.send("No music playing!!")
                return
            }
            player.pause(true)
            isPlaying = false
            isPaused = true
        }
        else if (command === "resume") {
            if (!isPaused) {
                await msg.channel.send("No music paused!!")
                return
            }
            player.unpause()
            isPlaying = true
            isPaused = false
        }
        else {
            let textChannel = msg.channel
            await textChannel.send("Unknown command")
        }
    }
})
client.login(TOKEN)
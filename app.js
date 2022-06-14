const { Client, Intents } = require("discord.js")
const { createAudioPlayer, AudioPlayerStatus, getVoiceConnection } = require("@discordjs/voice")
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
const queue = new Map()


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
        const userVoiceChannel = msg.member.voice.channel
        let textChannel = msg.channel

        if (command === "ping" && args.length === 0)
            await msg.reply("pong!")
        else if (command === "play") {
            if (!userVoiceChannel) {
                await textChannel.send("You need to be in a Voice Channel, to execute this command")
            }
            if (args.length === 0) {
                await textChannel.send("Please pass the arguments")
                return
            }
            if (!userVoiceChannel.joinable) {
                await textChannel.send("Not have permission to join your Voice Channel")
                return
            }
            let nameByUser = args.join(" ")
            let re = /https:\/\//
            let isLink = nameByUser.match(re)
            if (isLink) {
                await textChannel.send("Sorry, currently we are not playing media from external links. :(")
                return
            }
            try {
                let songData = await playMusic(msg, player, nameByUser, MUSIC_TOKEN)
                if (!songData) {
                    await textChannel.send("Sorry, could not find the media you've been looking")
                    return
                }
                await textChannel.send(`now playing: ${songData.title}`)
                isPlaying = true
            }
            catch (e) {
                console.log("error in recieving data")
                console.log(e)
            }
        }
        else if (command === "pause") {
            if (!isPlaying) {
                await textChannel.send("No music playing!!")
                return
            }
            player.pause(true)
            isPlaying = false
            isPaused = true
            await textChannel.send("Paused!!")
        }
        else if (command === "resume") {
            if (!isPaused) {
                await textChannel.send("No music paused!!")
                return
            }
            player.unpause()
            isPlaying = true
            isPaused = false
            await textChannel.send("Resumed!!")
        }
        else if (command === "stop") {
            if (!isPlaying) {
                await textChannel.send("No music playing!!")
                return
            }
            player.stop()
            isPlaying = false
        }
        else if (command === "dc" || command === "quit" || command === "disconnect") {
            let currConnection = getVoiceConnection(msg.member.guild.id)
            if (!currConnection) {
                await textChannel.send("I'm not in any Voice Channels. :(")
                return
            }
            player.stop()
            currConnection.disconnect()
            isPlaying = false
            isPaused = false
            await textChannel.send("Disconnected :(")
            return
        }
        else {
            await textChannel.send("Unknown command!!")
        }
    }
})
player.on("error", (error) => {
    console.log("error occurred in player")
    console.log(error)
})
client.login(TOKEN)
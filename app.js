const { Client, Intents } = require("discord.js")
const { createAudioPlayer } = require("@discordjs/voice")
const playMusic = require("./utils/playMusic")
const getMusic = require("./src/getMusic")
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
        const userGuild = msg.guild
        let textChannel = msg.channel

        if (command === "ping" && args.length === 0)
            await msg.reply("pong!")
        else if (command === "play") {
            let serverQueue = queue.get(userGuild.id)
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
            try {
                let songData = await getMusic(nameByUser, MUSIC_TOKEN)
                if (!songData) {
                    await textChannel.send("Sorry, could not find the media you've been looking")
                    return
                }
                let re = /https:\/\//
                let isLink = nameByUser.match(re)
                if (isLink) {
                    await textChannel.send("Sorry, currently we are not playing media from external links. :(")
                    return
                }
                if (!serverQueue) {
                    let thisServerQueue = {
                        textChannel: textChannel,
                        voiceChannel: userVoiceChannel,
                        guild: userGuild,
                        adapter: userGuild.voiceAdapterCreator,
                        connection: null,
                        songs: []
                    }
                    queue.set(userGuild.id, thisServerQueue)
                    thisServerQueue.songs.push(songData)
                    try {
                        await playMusic(player, thisServerQueue)

                        await textChannel.send(`Now Playing: ${thisServerQueue.songs[0].title}`)
                        isPlaying = true
                    }
                    catch (e) {
                        console.log("error in recieving data")
                        console.log(e)
                    }
                }
                else {
                    serverQueue.songs.push(songData)
                    await textChannel.send(`Added ${songData.title} to the queue!!`)
                }
            }
            catch (e) {
                console.log("error while fetching song data")
                console.log(e)
            }
        }
        else if (command === "np" || command === "nowPlaying") {
            let serverQueue = queue.get(userGuild.id)
            if (!serverQueue) {
                await textChannel.send("No music playing!!")
                return
            }
            await textChannel.send(`Now Playing : ${serverQueue.songs[0].title}`)
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
        else if (command === "skip") {
            let serverQueue = queue.get(userGuild.id)
            if (!serverQueue) {
                await textChannel.send("No music playing!!")
                return
            }
            player.stop()
        }
        else if (command === "q" || command === "queue") {
            let serverQueue = queue.get(userGuild.id)
            if (!serverQueue) {
                await textChannel.send("There's nothing playing in this server!!")
                return
            }
            let q = serverQueue.songs
            for (let songs of q) {
                await textChannel.send(songs.title)
            }
        }
        else if (command === "remove") {
            if (args.length === 0) {
                await textChannel.send("Please provide the argument.")
                return
            }
            let argument = args.join(" ")
            if (isNaN(argument)) {
                await textChannel.send("Please enter a valid argument")
                return
            }
            let serverQueue = queue.get(userGuild.id)
            if (!serverQueue) {
                await textChannel.send("No music playing, to remove")
                return
            }
            let songNum = parseInt(argument)
            if (songNum <= 0 || songNum > serverQueue.songs.length) {
                await textChannel.send("Invalid choice")
                return
            }
            if (songNum - 1 === 0) {
                player.stop()
                await textChannel.send(`Removed song : ${serverQueue.songs[0].title}`)
                return
            }
            let deletedSong = serverQueue.songs.splice(songNum - 1, 1)
            await textChannel.send(`Removed song : ${deletedSong[0].title}`)
        }
        else if (command === "dc" || command === "quit" || command === "disconnect") {
            let serverQueue = queue.get(userGuild.id)
            if (!serverQueue) {
                await textChannel.send("I'm not in any Voice Channels. :(")
                return
            }
            let currConnection = serverQueue.connection
            player.stop()
            currConnection.disconnect()
            queue.delete(userGuild.id)
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
player.on("stateChange", async (oldState, newState) => {
    if (newState.status === "idle" && oldState.status === "playing") {
        try {
            let guild_id = player.subscribers[0].connection.joinConfig.guildId
            let serverQueue = queue.get(guild_id)
            serverQueue.songs.shift()
            if (serverQueue.songs.length === 0) {
                await serverQueue.textChannel.send("End of the queue!! :(")
                serverQueue.connection.disconnect()
                queue.delete(guild_id)
                return
            }
            else {
                await playMusic(player, serverQueue)
                await serverQueue.textChannel.send(`Now Playing : ${serverQueue.songs[0].title}`)
            }
        }
        catch (e) {
            console.log("error while switching songs in queue")
            console.log(e)
        }
    }
})
player.on("error", (error) => {
    console.log("error occurred in player")
    console.log(error)
})
client.login(TOKEN)
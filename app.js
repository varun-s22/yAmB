const { Client, Intents, MessageAttachment } = require("discord.js")
const { createAudioPlayer } = require("@discordjs/voice")
const playMusic = require("./utils/playMusic")
const getMusic = require("./src/getMusic")
const createEmbed = require("./utils/createEmbed")
const isYoutubeLink = require("./utils/isYoutubeLink")
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
            await msg.reply("Pong!")
        else if (command === "help" && args.length === 0) {
            let iconLink = new MessageAttachment("./images/botIcon.png")
            let embed = createEmbed({
                title: "Help command!!",
                pingCommand: "ping",
                playCommand: "play",
                pauseCommand: "pause",
                resumeCommand: "resume",
                skipCommand: "skip",
                nowPlayingCommand: "np",
                queueCommand: "q",
                removeCommand: "remove",
                leaveCommand: "dc",
                helpCommand: "help"
            })
            embed.setThumbnail("attachment://botIcon.png")
            await textChannel.send({ embeds: [embed], files: [iconLink] })
        }
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
            let songData = {}
            try {
                let re = /https:\/\//
                let isLink = nameByUser.match(re)
                if (isLink) {
                    if (!isYoutubeLink(nameByUser)) {
                        await textChannel.send("Sorry, currently we are not playing media from external links. :(")
                        return
                    }
                    let songId = isYoutubeLink(nameByUser)
                    songData = {
                        id: songId,
                        title: "Youtube Video",
                        authorChannel: "External Youtube Link",
                        source: "YouTube",
                        thumbnailHigh: "https://cdn.discordapp.com/attachments/933824091482374166/991319195604222102/unknown.png"
                    }
                }
                else {
                    songData = await getMusic(nameByUser, MUSIC_TOKEN)
                }
                if (!songData) {
                    await textChannel.send("Sorry, could not find the media you've been looking")
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
                        let embed = createEmbed({
                            title: `Now Playing`,
                            description: thisServerQueue.songs[0].title,
                            thumbnail: thisServerQueue.songs[0].thumbnailHigh,
                            extra: thisServerQueue.songs[0].authorChannel,
                            footer: thisServerQueue.songs[0].source
                        })
                        await textChannel.send({ embeds: [embed] })
                        isPlaying = true
                    }
                    catch (e) {
                        console.log("error in recieving data")
                        console.log(e)
                    }
                }
                else {
                    serverQueue.songs.push(songData)
                    let embed = createEmbed({
                        title: "Adding To Queue",
                        description: songData.title,
                        extra: songData.authorChannel,
                        footer: songData.source
                    })
                    await textChannel.send({ embeds: [embed] })
                }
            }
            catch (e) {
                console.log("error while fetching song data")
                console.log(e)
            }
        }
        else if (command === "np" || command === "nowPlaying" && args.length === 0) {
            let serverQueue = queue.get(userGuild.id)
            if (!serverQueue) {
                let embed = createEmbed({ title: "No Music Playing" })
                await textChannel.send({ embeds: [embed] })
                return
            }
            let embed = createEmbed({
                title: "Now Playing",
                description: serverQueue.songs[0].title,
                thumbnail: serverQueue.songs[0].thumbnailHigh,
                extra: serverQueue.songs[0].authorChannel,
                footer: serverQueue.songs[0].source
            })
            await textChannel.send({ embeds: [embed] })
        }
        else if (command === "pause" && args.length === 0) {
            if (!isPlaying) {
                let embed = createEmbed({ title: "No Music Playing" })
                await textChannel.send({ embeds: [embed] })
                return
            }
            player.pause(true)
            isPlaying = false
            isPaused = true
            let embed = createEmbed({ title: "Paused!!" })
            await textChannel.send({ embeds: [embed] })
        }
        else if (command === "resume" && args.length === 0) {
            if (!isPaused) {
                let embed = createEmbed({ title: "No Music Paused" })
                await textChannel.send({ embeds: [embed] })
                return
            }
            player.unpause()
            isPlaying = true
            isPaused = false
            let embed = createEmbed({ title: "Resumed!!" })
            await textChannel.send({ embeds: [embed] })
        }
        else if (command === "skip" && args.length === 0) {
            let serverQueue = queue.get(userGuild.id)
            if (!serverQueue) {
                let embed = createEmbed({ title: "No Music Playing" })
                await textChannel.send({ embeds: [embed] })
                return
            }
            player.stop()
        }
        else if (command === "q" || command === "queue" && args.length === 0) {
            let serverQueue = queue.get(userGuild.id)
            if (!serverQueue) {
                let embed = createEmbed({ title: "There is nothing playing in server!!" })
                await textChannel.send({ embeds: [embed] })
                return
            }
            let q = serverQueue.songs.slice(1)
            let queueStr = ""
            let i = 2
            for (let song of q) {
                queueStr = queueStr + `**${i})**   ` + `${song.title} by ${song.authorChannel}\n`
                i++
            }
            let nowPlayingSong = `${serverQueue.songs[0].title} by ${serverQueue.songs[0].authorChannel}`
            let queueIconLink = new MessageAttachment("./images/queueIcon.png")
            let embed = createEmbed({
                title: "Queue",
                description: "Here are the songs you've added",
                comingUpSongs: queueStr,
                nowPlayingField: nowPlayingSong,
                footer: `Requested By: ${msg.author.username}`
            })
            embed.setThumbnail("attachment://queueIcon.png")
            await textChannel.send({ embeds: [embed], files: [queueIconLink] })
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
                let embed = createEmbed({
                    title: "Removed Song :(",
                    description: serverQueue.songs[0].title
                })
                await textChannel.send({ embeds: [embed] })
                return
            }

            let deletedSong = serverQueue.songs.splice(songNum - 1, 1)
            let embed = createEmbed({
                title: "Removed Song :(",
                description: deletedSong[0].title
            })
            await textChannel.send({ embeds: [embed] })
        }
        else if (command === "dc" || command === "quit" || command === "disconnect" && args.length === 0) {
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
                let embed = createEmbed({ title: "End of Queue :(" })
                await serverQueue.textChannel.send({ embeds: [embed] })
                serverQueue.connection.disconnect()
                queue.delete(guild_id)
                return
            }
            else {
                await playMusic(player, serverQueue)
                let embed = createEmbed({
                    title: "Now Playing",
                    description: serverQueue.songs[0].title,
                    thumbnail: serverQueue.songs[0].thumbnailHigh,
                    extra: serverQueue.songs[0].authorChannel,
                    footer: serverQueue.songs[0].source
                })
                await serverQueue.textChannel.send({ embeds: [embed] })
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
const { MessageEmbed } = require("discord.js")

let createEmbed = (arg) => {
    const embed = new MessageEmbed()
    embed.setColor("RANDOM")
    if (arg.title)
        embed.setTitle(arg.title)
    if (arg.nowPlayingField)
        embed.addField("🔊Now Playing: ", arg.nowPlayingField)
    if (arg.comingUpSongs)
        embed.addField("Coming Up Next: ", arg.comingUpSongs)
    if (arg.description)
        embed.setDescription(arg.description)
    if (arg.thumbnail)
        embed.setThumbnail(arg.thumbnail)
    if (arg.extra)
        embed.addField("Song By: ", arg.extra, true)
    if (arg.songAddedBy)
        embed.addField("Added By: ", arg.songAddedBy, true)
    if (arg.footer) {
        embed.setFooter({
            text: arg.footer
        })
    }
    if (arg.pingCommand)
        embed.addField("Ping", "Use `~ping` to get current ping.", true)
    if (arg.playCommand)
        embed.addField("Play", "Use `~play <song name>` to play a song.", true)
    if (arg.pauseCommand)
        embed.addField("Pause", "Use `~pause` to pause the current playing song.", true)
    if (arg.resumeCommand)
        embed.addField("Resume", "Use `~resume` to resume the currently paused song.", true)
    if (arg.skipCommand)
        embed.addField("Skip", "Use `~skip` to skip the currently playing song.", true)
    if (arg.nowPlayingCommand)
        embed.addField("Now Playing", "Use `~np` or `~nowPlaying` to get the song, which is currently playing.", true)
    if (arg.queueCommand)
        embed.addField("Queue", "Use `~q` or `~queue` to get the queue of the songs added.", true)
    if (arg.removeCommand)
        embed.addField("Remove Song", "Use `~remove <song number>` to remove the song from the queue. Pass the position of the song as argument to remove.", true)
    if (arg.leaveCommand)
        embed.addField("Disconnect", "Use `~dc`,`~quit`, or `~disconnect` to disconnect the bot from voice channel.", true)
    if (arg.helpCommand)
        embed.addField("Help", "Use `~help` to get the help command.", true)
    return embed
}

module.exports = createEmbed
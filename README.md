# Yet Another Music Bot

A simple music bot, which plays the songs requested by user on Discord.

## Commands

It uses `~` as it default prefix. So you can send a command on Discord, using the default prefix. 
To play a song, type
```
~play <song name>
```
on discord, to play a song.

It has various commands like: `~play`,`~pause`,`~resume`,`~skip`,`~nowPlaying`,`~disconnect`,`~queue`, `~remove` .etc
You can find more about them using help command on Discord.

## Setup

To host it locally on your machine, 

Install [NodeJs](https://nodejs.org/en/download/)

Clone this repository
```
git clone git@github.com:varun-s22/yAmB.git
```
Create a `.env` file, on the root directory. It should look something like this
```
DISCORD_TOKEN = < your Discord Token >
YOUTUBE_KEY = < your Youtube API key >
```

You can get the `DISCORD_TOKEN`, by going to Discord Developer Section, or follow the guide [here](https://www.writebots.com/discord-bot-token/)

For `YOUTUBE_KEY`, you can get the API key from [here](https://developers.google.com/youtube/v3)

After setting up the `.env` file.
Run
```
npm install
```
to get the required dependencies.

Now that you've got your dependencies, run the `app.js` file by
```
node app.js
```
to start the bot on your local machine.

NOTE: If you face any error, while installing the dependencies, feel free to contact me. 

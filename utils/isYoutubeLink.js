const isYoutubeLink = (link) => {
    const re = /https:\/\/www.youtube.com\/watch\?v=(.{11})/
    let isLink = link.match(re)
    if (!isLink)
        return false
    return isLink[1]
}
module.exports = isYoutubeLink
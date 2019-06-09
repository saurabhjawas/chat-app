const generateMessage = (username, text) => {
    return {
        username, text, createdAt: new Date().getTime()
    }
} 

const generateLocationMessage = (username, url) => ({ username, url, sharedAt: new Date().getTime()})

module.exports = {
    generateMessage,
    generateLocationMessage
}
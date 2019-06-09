const socket =  io()

const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton =  $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const $sidebar = document.querySelector('#sidebar')

// templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
const {username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    // newest message elemt
    const $newMessgae = $messages.lastElementChild

    //  height of the newest message
    const newMessageStyles = getComputedStyle($newMessgae)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessgae.offsetHeight + newMessageMargin

    // visible height of message container
    const visibleHeight = $messages.offsetHeight

    // total height of message container
    const containerHeight = $messages.scrollHeight

    // how far have I scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (msg) => {
    // console.log('Message received: ' + msg);
    const html = Mustache.render(messageTemplate, {
        userName: msg.username,
        message: msg.text,
        createdAt: moment(msg.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    // console.log(html);
    autoscroll()
})

socket.on('locationMessage', (location) => {
    // console.log(url);
    const html = Mustache.render(locationTemplate,{
        userName: location.username,
        mapUrl: location.url,
        sharedAt: moment(location.sharedAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room, users
    })

    $sidebar.innerHTML = html
})


$messageForm.addEventListener('submit', (evt) => {
    evt.preventDefault()

    const message = $messageFormInput.value

    // no need to do anything if textbox is blank
    if (!message) {
        return
    }
    //disbale the form
    $messageFormButton.setAttribute('disabled', 'disabled')

    socket.emit('sendMessage', message, (error) => {

        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

       if (error) {
        //    return console.log(error);
        alert(error)
       }

       console.log('Message delivered');
    })
})

$sendLocationButton.addEventListener('click', (evt) => {
    evt.preventDefault()

    if (!navigator.geolocation) {
        return alert('geolocation not supported')
    }
    
    $sendLocationButton.setAttribute('disabled', 'disabled')
    
    navigator.geolocation.getCurrentPosition((position) => {
        // console.log('Sendong position');
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, (error) => {
            $sendLocationButton.removeAttribute('disabled')

            if (error) {
                return console.log(`Could NOT share the location!! error: ${error}`);
            }
            // console.log('Location shared!!');
        })
    })

})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})
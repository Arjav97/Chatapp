const socket = io()

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = document.querySelector('input')
const $messageFormButton = document.querySelector('button')
const $sendlocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
//const $locations = document.querySelector('#locations')

//Templates
const messagetemplate = document.querySelector('#message-template').innerHTML
const locationmessagetemplate = document.querySelector('#location-message-template').innerHTML
const sidebartemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const { username , room } = Qs.parse(location.search , {ignoreQueryPrefix:true})

const autoscroll = () => {
    const $newMessage = $messages.lastElementChild

    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    const visibleHeight = $messages.offsetHeight

    const containerHeight = $messages.scrollHeight
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message',(msg) => {
    console.log(msg)
    const html = Mustache.render(messagetemplate,{
        username:msg.username,
        msg:msg.text,
        createdAt:moment(msg.createdAt).format('h:mm a')
    }) 
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('location',(msg) => {
    console.log(msg)
    const html = Mustache.render(locationmessagetemplate,{
        username:msg.username,
        url:msg.url,
        createdAt:moment(msg.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

$messageForm.addEventListener('submit',(e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled','disabled')

   const message = e.target.elements.message.value
   
   socket.emit('usermessage', message , (error) => {
    $messageFormButton.removeAttribute('disabled')
    $messageFormInput.value = ''
    $messageFormInput.focus()
    if(error){
        return console.log('Profanity is not allowed ')
    }
       console.log('Message has been delievered')
    })

})

$sendlocationButton.addEventListener('click', () => {
    
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by browser')
    }
    $sendlocationButton.setAttribute('disable','disable')

    navigator.geolocation.getCurrentPosition((position) => {
        
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        },()=>{
            $sendlocationButton.removeAttribute('disable')
            console.log('Location shared')
        })
    })
})

socket.on('roomData',(msg) => {
    const html = Mustache.render(sidebartemplate,{
        room:msg.room,
        users:msg.users
    })
    document.querySelector('#sidebar').innerHTML = html
})

socket.emit('join',{ username , room },(error) => {
    if(error){
        alert(error)
        location.href='/'
    }
})
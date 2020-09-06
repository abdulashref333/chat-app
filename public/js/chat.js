const socket = io();

const $messageForm = document.querySelector('#form-message');
const $messageFormInbut = document.querySelector('input');
const $messageFormButton = document.querySelector('button');
const $sendLocationButton = document.querySelector('#btn-send-location');
const $sendImageButton = document.querySelector('#btn-send-img');
const $message = document.querySelector('#message');
const $messages = document.querySelector('#messages');

const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#locationMess-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

const {username, roomname} = Qs.parse(location.search,{ignoreQueryPrefix:true});

const uploader = new SocketIOFileUpload(socket);
uploader.listenOnInput(document.getElementById("siofu_input"));

socket.on('message',(message)=>{
    const html = Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt: moment(message.timeStamp).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend',html);
    $messages.scrollTop = $messages.scrollHeight;
})

socket.on('locationMessage',(locMessage)=>{
    const html = Mustache.render(locationTemplate,{
        username:locMessage.username,
        locMessage:locMessage.text,
        createdAt:moment(locMessage.timeStamp).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend',html);
    $messages.scrollTop = $messages.scrollHeight;
})

socket.on('roomData',({room,users})=>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    });
    document.querySelector('#sidebar').innerHTML= html;
})

socket.on('fileUpload',({img, error})=>{
    if(error){
        return alert(error);
    }
    $messages.insertAdjacentHTML('beforeend',img);
    $messages.scrollTop = $messages.scrollHeight;
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    $messageFormButton.setAttribute('disabled','disabled');
    
    const message = e.target.elements.message.value;
    
    socket.emit('sendMessage',message,(error)=>{
        $messageFormButton.removeAttribute('disabled');
        $messageFormInbut.value = '';
        $messageFormInbut.focus();

        if(error){
            return alert(error);
        }

        console.log('Message Delevered.');
    });
});

$sendLocationButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('you browser not suport this feature');
    }
    $sendLocationButton.setAttribute('disabled','disabled');

    navigator.geolocation.getCurrentPosition((pos)=>{
        socket.emit('sendLocation',{
            longitude:pos.coords.longitude,
            latitude:pos.coords.latitude
        },(message)=>{
            $sendLocationButton.removeAttribute('disabled');
            console.log(message);
        });
    })
});
$sendImageButton.addEventListener('click',(e)=>{
    e.preventDefault();
    if (siofu_input) {
        siofu_input.click();
    }
});

socket.emit('join',{username, roomname},(error)=>{
    if(error){
        alert(error);
        location.href = '/'
    }
});

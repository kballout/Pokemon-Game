const input = document.querySelector('#inputMessage');
const box = document.querySelector('#displayArea');
const form = document.querySelector('#chat');
const user = document.querySelector('#userName')
const startBtn = document.querySelector('#startGame');
let prevImage = document.querySelector('#pokemonImage');
const scoreboard = document.querySelector('#usersInLobby');
const clock = document.querySelector('#clock')
let time = 0;
let socket = io();

window.onload = function(){
    let li = document.createElement('li')
    scoreboard.appendChild(li);
    li.textContent = user.innerHTML + ': \t 0 Pts';
    socket.on('connect', () => {
        document.querySelector('#invite').innerHTML = socket.id;
        socket.emit('createGame', {
            user: user.innerHTML, 
            id: socket.id
        });
    })
}

//BEGIN GAME
startBtn.addEventListener('click', ()=>{
    startBtn.style.display = 'none';
    socket.emit('startGame', {
        id: socket.id
    });
})




//SOCKET LISTENERS
socket.on('getNext', (data) => {
    console.log(data);
    beginTimer();
    prevImage.setAttribute('src', 'data:image/jpeg;base64,' + data.image.buffer);
})

socket.on('userJoined', (data) => {
    let li = document.createElement('li')
    scoreboard.appendChild(li);
    li.textContent = data.user + ': \t 0 Pts';
})

socket.on('getMessage', (message)=>{
    displayMsg(message);
})

socket.on('userLeftRoom', (user) => {
    console.log(user)
    for(let element of scoreboard.children){
        if(element.innerHTML.includes(user)){
            scoreboard.removeChild(element);
        }
    }
 })



//CHAT
form.addEventListener('submit', (event) => {
    event.preventDefault();
    let message = input.value

    if(message  !== ""){
        let msg = user.innerHTML + ': ' + message + '\n';
        socket.emit('sendMessage', {
            msg: msg,
            id: document.querySelector('#invite').innerHTML
        });
        

        input.value = "";
    }
})

function displayMsg(message){
    box.append(message)
}


//TIMER
function beginTimer(){
    if(time > 5){
        time = 0;
        nextRoundTimer();
    }
    else{
        setTimeout(() => {
            clock.innerHTML = `Time Left:   ${5 - time}  sec`;
            time++;
            beginTimer();
        }, 1000);
    }
}

    
function nextRoundTimer(){
    if(time > 3){
        time = 0;
        setTimeout(() => {
            socket.emit('startGame', {
                id: socket.id
            });
        }, 1000);
    }
    else{
        setTimeout(() => {
            clock.innerHTML = `Time Up! Starting next round in ${3 - time}..`
            time++;
            nextRoundTimer();
        }, 1000);
    }
}

const input = document.querySelector('#inputMessage');
const box = document.querySelector('#displayArea');
const form = document.querySelector('#chat');
const user = document.querySelector('#userName')
const gameid = document.querySelector('#gameId');
let prevImage = document.querySelector('#pokemonImage');
const scoreboard = document.querySelector('#usersInLobby');
const clock = document.querySelector('#clock')
let time = 0;
let socket = io();

window.onload = function(){
    socket.on('connect', () => {
       socket.emit('joinGame', {
           user: user.innerHTML, 
           id: gameid.innerHTML
       });
    })
}
    



//SOCKET LISTENERS
socket.on('getMessage', (message)=>{
    displayMsg(message);
})

socket.on('getNext', (data) => {
    console.log(data);
    beginTimer();
    prevImage.setAttribute('src', 'data:image/jpeg;base64,' + data.image.buffer);
})

socket.on('userJoined', (data, users) => {
    if(scoreboard.children.length === 0){
        for(let user of users){
            let li = document.createElement('li')
            scoreboard.appendChild(li);
            li.textContent = user['User'] + ': \t 0 Pts';
        }
    }
    else{
        for(let element of scoreboard.children){
            if(element.innerHTML.includes(user['User'] + ':')){
            }
            else{
                let li = document.createElement('li')
                scoreboard.appendChild(li);
                li.textContent = user['User'] + ': \t 0 Pts';
            }
        }
    }
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
    const message = input.value

    if(message  !== ""){
        let msg = user.innerHTML + ': ' + message + '\n';
        socket.emit('sendMessage', {
            msg: msg,
            id: gameid.innerHTML
        });
        input.value = "";
    }
})

function displayMsg(message){
    box.append(message);
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
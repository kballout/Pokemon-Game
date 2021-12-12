let input = document.querySelector('#inputMessage');
let box = document.querySelector('#displayArea');
let form = document.querySelector('#chat');
let user = document.querySelector('#userName')
let gameid = document.querySelector('#gameId');
let host = document.querySelector('#host');
let prevImage = document.querySelector('#pokemonImage');
let scoreboard = document.querySelector('#usersInLobby');
let clock = document.querySelector('#clock')
let guessForm = document.querySelector('#guess');
let guessInputJoin = document.querySelector('#guessInput');
let submitButtonJoin = document.querySelector('#submitButton');
let answerJoin = document.querySelector('#correctAnswer');
let solution;
let time = 0;
let socket = io();
let scoreMap = new Map();



function setIp(Ip){
    ip = Ip
}

window.onload = function(){
    
    socket.on('connect', () => {
       socket.emit('joinGame', {
           user: user.innerHTML, 
           id: gameid.innerHTML
       });
    })
}

//Chat form
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
    

//Guess button is clicked
guessForm.addEventListener('submit', (event)=>{
    event.preventDefault();
    let userGuess = guessInputJoin.value
    if(userGuess === solution){
        socket.emit('correctGuess', {
            id: gameid.innerHTML,
            user: user.innerHTML
        })
    }
})


//Edit pts in scoreboard
function editScoreboard(winner){
    for(let element of scoreboard.children){
        if(element.innerHTML.includes(winner)){
            let newScore = scoreMap.get(winner);
            element.innerHTML = winner + '\t' + newScore + ' pts'
        }
    }
}






//SOCKET LISTENERS
//Get message in chat
socket.on('getMessage', (message)=>{
    displayMsg(message);
})

//Get next image
socket.on('getNext', (data) => {
    console.log(data);
    solution = data.name;
    document.getElementById('pokemonImage').style.filter = "contrast(0%)"
    document.getElementById('pokemonImage').style.filter = "brightness(0%)"
    prevImage.setAttribute('src', 'data:image/jpeg;base64,' + data.image.buffer);
    guessInputJoin.value = '';
    answerJoin.innerHTML = 'Pokemon: ?';
    submitButtonJoin.disabled = false;
    beginTimer();
})

//New user joined the room
socket.on('joinedTheHost', (data) => {
    console.log(data)
    // let li = document.createElement('li')
    // scoreboard.appendChild(li);
    // scoreMap.set(data.user, 0);
    // li.textContent = data.user + ': \t 0 Pts';
});

//User left the room
socket.on('userLeftRoom', (user) => {
    console.log(user)
    for(let element of scoreboard.children){
        if(element.innerHTML.includes(user)){
            scoreboard.removeChild(element);
        }
    }
 })

//Scoreboard update
socket.on('scoreboard', (data) => {
    for(let element of scoreboard.children){
        scoreboard.removeChild(element);
    }
    let array = data.scoreboard;
    for(let next of array){
        let li = document.createElement('li')
        scoreboard.appendChild(li);
        li.textContent = next;
    }
})

//User guessed correctly
socket.on('userGuessedCorrectly', (winner) => {
    submitButtonJoin.disabled = true;
    document.getElementById('pokemonImage').style.filter = "contrast(100%)"
    document.getElementById('pokemonImage').style.filter = "brightness(100%)"
    time = 10;
    answerJoin.innerHTML = 'Pokemon: ' + solution;
    // let currentScore = scoreMap.get(winner.winner);
    // currentScore++;
    // scoreMap.set(winner.winner, currentScore);
    // editScoreboard(winner.winner)
 })

 











//TIMER
function beginTimer(){
    if(time > 10){
        time = 0;
        nextRoundTimer();
    }
    else{
        setTimeout(() => {
            clock.innerHTML = `Time Left:   ${10 - time}  sec`;
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
            document.getElementById('pokemonImage').style.filter = "contrast(100%)"
            document.getElementById('pokemonImage').style.filter = "brightness(100%)"
            clock.innerHTML = `Time Up! Starting next round in ${3 - time}..`
            answerJoin.innerHTML = 'Pokemon: ' + solution;
            time++;
            nextRoundTimer();
        }, 1000);
    }
}
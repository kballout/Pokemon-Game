let input = document.querySelector('#inputMessage');
let box = document.querySelector('#displayArea');
let form = document.querySelector('#chat');
let user = document.querySelector('#userName')
let gameid = document.querySelector('#gameId');
let prevImage = document.querySelector('#pokemonImage');
let scoreboard = document.querySelector('#usersInLobby');
let clock = document.querySelector('#clock')
let guessForm = document.querySelector('#guess');
let guessInputJoin = document.querySelector('#guessInput');
let submitButtonJoin = document.querySelector('#submitButton');
let answerJoin = document.querySelector('#correctAnswer');
let solution;
let gameOver = false;
let time = 0;
let socket = io();
let scoreMap = new Map();



function setIp(Ip){
    ip = Ip
}

window.onload = function(){
    socket.on('connect', () => {
       socket.emit('joinGame', {
           ip: ip,
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

function updateScoreboard(user){
    let li = document.createElement('li')
    scoreboard.appendChild(li);
    li.textContent = user + ': \t ' + scoreMap.get(user) + ' Pts';
}




//SOCKET LISTENERS
//Get message in chat
socket.on('getMessage', (message)=>{
    displayMsg(message);
})

//Get next image
socket.on('getNext', (data) => {
    if(gameOver === false){
        solution = data.name;
        document.getElementById('pokemonImage').style.filter = "contrast(0%)"
        document.getElementById('pokemonImage').style.filter = "brightness(0%)"
        prevImage.setAttribute('src', 'data:image/jpeg;base64,' + data.image.buffer);
        guessInputJoin.value = '';
        answerJoin.innerHTML = 'Pokemon: ?';
        submitButtonJoin.disabled = false;
        beginTimer();
    }
    else{
        prevImage.setAttribute('src', '/images/QuestionMark.png');
        submitButton.disabled = true;
        clock.innerHTML = 'Game Over';
    }
})

//New user joined the room
socket.on('userJoined', (data, usersInRoom) => {
    console.log(data)
    console.log(usersInRoom)
    for(let user of usersInRoom){
        if(!scoreMap.has(user.User)){
            scoreMap.set(user.User, user.Score);
            updateScoreboard(user.User);
        }
    }
});

//User left the room
socket.on('userLeftRoom', (user) => {
    scoreMap.delete(user);
    for(let element of scoreboard.children){
        if(element.innerHTML.includes(user)){
            scoreboard.removeChild(element);
        }
    }
 })

//User guessed correctly
socket.on('userGuessedCorrectly', (winner) => {
    submitButtonJoin.disabled = true;
    document.getElementById('pokemonImage').style.filter = "contrast(100%)"
    document.getElementById('pokemonImage').style.filter = "brightness(100%)"
    time = 10;
    answerJoin.innerHTML = 'Pokemon: ' + solution;
    let currentScore = scoreMap.get(winner.winner);
    currentScore++;
    scoreMap.set(winner.winner, currentScore);
    editScoreboard(winner.winner)
 })

socket.on('gameOver', () => {
    time = 10;
    gameOver = true;
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
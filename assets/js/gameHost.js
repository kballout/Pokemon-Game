let input = document.querySelector('#inputMessage');
let box = document.querySelector('#displayArea');
let form = document.querySelector('#chat');
let user = document.querySelector('#userName')
let startBtn = document.querySelector('#startGame');
let prevImage = document.querySelector('#pokemonImage');
let scoreboard = document.querySelector('#usersInLobby');
let clock = document.querySelector('#clock');
let guessForm = document.querySelector('#guess');
let guessInput = document.querySelector('#guessInput');
let submitButton = document.querySelector('#submitButton');
let answer = document.querySelector('#correctAnswer');
let solution;
let time = 0;
let ip;
let socket = io();
let scoreMap = new Map();



function setIp(Ip){
    ip = Ip
}


window.onload = function(){
    scoreMap.set(user.innerHTML, 0);
    let li = document.createElement('li')
    scoreboard.appendChild(li);
    li.textContent = user.innerHTML + ': \t 0 Pts';
    socket.on('connect', () => {
        document.querySelector('#invite').innerHTML = socket.id;
        socket.emit('createGame', {
            ip: ip, 
            user: user.innerHTML, 
            id: socket.id
        });
    })
}

//Start button is clicked and game begins
startBtn.addEventListener('click', ()=>{
    startBtn.style.display = 'none';
    socket.emit('startGame', {
        id: socket.id
    });
})

//Chat buttton
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

//Submit button for guess is clicked
guessForm.addEventListener('submit', (event)=>{
    event.preventDefault();
    let userGuess = guessInput.value
    if(userGuess === solution){
        socket.emit('correctGuess', {
            id: socket.id,
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
//Next image
socket.on('getNext', (data) => {
    // let list = document.getElementsByTagName('li');
    // let array = [];
    // for(let element of list){
    //     array.push(element.innerHTML);
    // }
    // socket.emit('updateScores', {
    //     scoreboard: array
    // })
    solution = data.name;
    document.getElementById('pokemonImage').style.filter = "contrast(0%)"
    document.getElementById('pokemonImage').style.filter = "brightness(0%)"
    prevImage.setAttribute('src', 'data:image/jpeg;base64,' + data.image.buffer);
    guessInput.value = '';
    answer.innerHTML = 'Pokemon: ?';
    submitButton.disabled = false;
    beginTimer();
})

//New user joined room
socket.on('userJoined', (data) => {
    let li = document.createElement('li')
    scoreboard.appendChild(li);
    scoreMap.set(data.user, 0);
    li.textContent = data.user + ': \t 0 Pts';
})

//Get chat message
socket.on('getMessage', (message)=>{
    displayMsg(message);
})

//User left the room
socket.on('userLeftRoom', (user) => {
    console.log(user)
    for(let element of scoreboard.children){
        if(element.innerHTML.includes(user)){
            scoreboard.removeChild(element);
        }
    }
 })

 //User guessed correctly
 socket.on('userGuessedCorrectly', (winner) => {
    submitButton.disabled = true;
    document.getElementById('pokemonImage').style.filter = "contrast(100%)"
    document.getElementById('pokemonImage').style.filter = "brightness(100%)"
    time = 10;
    answer.innerHTML = 'Pokemon: ' + solution;
    let currentScore = scoreMap.get(winner.winner);
    currentScore++;
    scoreMap.set(winner.winner, currentScore);
    editScoreboard(winner.winner)
 })

//Send updated scoreboard
function sendUpdatedScores(){
    
}






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
            socket.emit('startGame', {
                id: socket.id
            });
        }, 1000);
    }
    else{
        setTimeout(() => {
            document.getElementById('pokemonImage').style.filter = "contrast(100%)"
            document.getElementById('pokemonImage').style.filter = "brightness(100%)"
            clock.innerHTML = `Time Up! Starting next round in ${3 - time}..`
            answer.innerHTML = 'Pokemon: ' + solution;
            time++;
            nextRoundTimer();
        }, 1000);
    }
}
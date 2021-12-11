const express = require('express'); //Express server
const socketio = require('socket.io'); //Connecting clients
const http = require('http');
const fs = require('fs'); //File system
const app = express();
const port = 3000;
const DB = require('./mongodb'); //Database
let mongo = new DB();

app.set('views', __dirname + '/views');
app.set('view engine', 'pug');
app.use(express.static(`${__dirname}/assets`));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

const server = http.createServer(app);
const io = socketio(server);
let pokeMap = getPokeMap();
let nextImage;

io.on('connection', socket =>{
    socket.on('userEnteredPage', async (data) => {
        let found = false;
        if(data.ip != null){
            let listOfIps = await mongo.getIps();
            for(let ips of listOfIps){
                if(data.ip === ips.Ip){
                    found = true;
                    break;
                }
            }
            if(found === false){
               await mongo.createUser('', 1, data.ip)
            }
        }
    })
    socket.on('createGame', (data) => {
        mongo.updateGameId(data.user, data.id);
        mongo.updateCurrentRoom(data.user, data.id);
        socket.join(data.socket);
    })
    socket.on('disconnect', async function(){
        let user = await mongo.getUserBySocket(socket.id)
        let room = await mongo.getCurrentRoomBySocket(socket.id);
        mongo.deleteUser(socket.id);
        //io.in(room.Current_Room).emit('userLeftRoom', user.User + ':');

    })
    socket.on('joinGame', async (data)=>{
        mongo.updateGameId(data.user, socket.id);
        mongo.updateCurrentRoom(data.user, data.id);
        let usersInRoom = await mongo.getUsersInARoom(data.id);
        socket.join(data.id);
        io.in(data.id).emit('userJoined', data, usersInRoom);
    })
    socket.on('sendMessage', (data)=>{
        io.in(data.id).emit('getMessage', data.msg);
    })
    socket.on('startGame', (data)=>{

        nextImage = getRandomPokemon(pokeMap);
        console.log(nextImage)
        fs.readFile('./pictures/' + nextImage, (error, image) => {
            io.in(data.id).emit('getNext',{
                image: {image: true, buffer: image.toString('base64')}, 
                name: nextImage.substring(0, nextImage.length - 3)
            });
        })
    })
})



//Get methods
app.get('/', async (req, res) => {
    let allUsers = await mongo.getUsers();
    res.render('main', {
        subtitle: 'Home',
        users: allUsers
    })
})

app.get('/game/:user' , async (req, res) => {
    res.render('gameHost',{
        user: req.params.user
    })
})

app.get('/menu/:user' , async (req, res) => {
    res.render('menu',{
        user: req.params.user
    })
})

//Errors
app.get('/userError', (req, res) => {
    res.render('errors/usernameTaken');
})




//Post methods
app.post('/connect', async (req, res) => {
    let result = 'verified';
    let name = req.body.username;
    let allUsers = await mongo.getUsers();
    console.log(allUsers)
    for(let user of allUsers){
        if(name === user.User){
            result = 'error'
            break;
        }
    }
    if(result === 'verified'){
        mongo.updateUsername(req.body.ip, name)
        res.redirect('/menu/' + name);
    }
    else{
        res.redirect('/userError');
    }
})

app.post('/deleteUser', async (req, res) => {
    if(req.body.name !== ''){
        await mongo.deleteUser(req.body.name);
    }
 })

app.post('/join', async (req, res) => {
    res.render('gameJoin', {
        id: req.body.gameID,
        user: req.body.username
    })
 })

 app.post('/getIds', async (req, res) => {
     console.log(req.body)
    let ids = await mongo.getIds();
    res.json({
        userIds: ids
    })    
 })


server.listen(port, () => console.log(`Server is listening on port ${port}`));




function getPokeMap(){
    let pokeMap = [];
    const files = fs.readdirSync('./pictures');
    for(let i = 0; i < files.length; i++){
        pokeMap.push(files[i]);
    }
    return pokeMap;
}


function getRandomPokemon(pokeMap){
    return(pokeMap[Math.floor(Math.random() * pokeMap.length)]);
}


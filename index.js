const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const fs = require('fs');
const app = express();
const port = 3000;
const DB = require('./mongodb');
let mongo = new DB();

app.set('views', __dirname + '/views');
app.set('view engine', 'pug');
app.use(express.static(`${__dirname}/assets`));
app.locals.basedir = `${__dirname}/assets`;
app.use(express.urlencoded({extended: true}));
const server = http.createServer(app);
const io = socketio(server);
let pokeMap = getPokeMap();
let nextImage;

io.on('connection', socket =>{
    socket.on('createGame', (data) => {
        mongo.updateGameId(data.user, data.id);
        mongo.updateCurrentRoom(data.user, data.id);
        socket.join(data.socket);
    })
    socket.on('disconnect', async function(){
        let user = await mongo.getUserBySocket(socket.id)
        let room = await mongo.getCurrentRoomBySocket(socket.id);
        mongo.deleteUser(socket.id);
        io.in(room.Current_Room).emit('userLeftRoom', user.User + ':');

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






app.get('/', async (req, res) => {
    res.render('index', {
        subtitle: 'Connect',
    })
})

app.get('/game/:user' , async (req, res) => {
    res.render('gameHost',{
        user: req.params.user
    })
})






app.post('/join', async (req, res) => {
    res.render('gameJoin', {
        id: req.body.gameID,
        user: req.body.username
    })
 })


app.post('/getusers', async (req, res) => {
    let allUsers = await mongo.getUsers();
    res.json({
        users: allUsers
    })    
 })

 app.post('/getIds', async (req, res) => {
    let ids = await mongo.getIds();
    res.json({
        userIds: ids
    })    
 })


app.post('/connect', async (req, res) => {
   let check = await mongo.checkIfUserExists(req.body.username);
   if(check === true){
       res.redirect('/');
   }
   else{
    mongo.createUser(req.body.username, 1);
    res.render('home', {
        subtitle: 'Home',
        user: req.body.username
    })
   }
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
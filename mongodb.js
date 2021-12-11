const { MongoClient } = require("mongodb");
const config = require('./config.json');
const dbName = 'PokemonGame'
let database; //global

class DB {
    #url

    constructor() {
        this.#url = config.mongoURI;
    }

    async #connect() {
            let client = new MongoClient(this.#url);
            await client.connect();
            return client;
    }

    async getUsers(){
        let client = this.#connect();
        database = (await client).db(dbName);
        let doc = database.collection('Users');
        return await doc.find({},{projection:{'_id': 0, 'User': 1}}).toArray();
    }

    async getIds(){
        let client = this.#connect();
        database = (await client).db(dbName);
        let doc = database.collection('Users');
        return await doc.find({},{projection:{'_id': 0, 'Socket': 1}}).toArray();
    }

    async getIps(){
        let client = this.#connect();
        database = (await client).db(dbName);
        let doc = database.collection('Users');
        return await doc.find({},{projection:{'_id': 0, 'Ip': 1}}).toArray();
    }

    async checkIfUserExists(user){
        let client = this.#connect();
        database = (await client).db(dbName);
        let doc = database.collection('Users');
        doc = await doc.findOne({User:user})
        if(doc === null){
            return false;
        }
        return true;
    }

    async createUser(username, socket, ip){
        let client = this.#connect();
        database = (await client).db(dbName);
        let doc = database.collection('Users');
        let newUser = {
            Ip: ip,
            User: username,
            Socket: socket,
            High_Score: '0%',
            Current_Room: 'none'
        }
        await doc.insertOne(newUser);
    }

    async deleteUser(socket){
        let client = this.#connect();
        database = (await client).db(dbName);
        let doc = database.collection('Users');
        await doc.deleteOne({Socket: socket});
    }

    async updateGameId(user, socket){
        let client = this.#connect();
        database = (await client).db(dbName);
        let doc = database.collection('Users');
        let update = {
            $set:{
                Socket:socket
            }
        }
        await doc.updateOne({User: user},update, {upsert: true});
    }

    async updateUsername(ip, username){
        let client = this.#connect();
        database = (await client).db(dbName);
        let doc = database.collection('Users');
        let update = {
            $set:{
                User:username
            }
        }
        await doc.updateOne({Ip: ip},update, {upsert: true});
    }

    async updateCurrentRoom(user,room){
        let client = this.#connect();
        database = (await client).db(dbName);
        let doc = database.collection('Users');
        let update = {
            $set:{
                Current_Room:room
            }
        }
        await doc.updateOne({User: user},update, {upsert: true});
    }

    async getUsersInARoom(room){
        let client = this.#connect();
        database = (await client).db(dbName);
        let doc = database.collection('Users');
        return await doc.find({Current_Room: room},{projection:{'_id': 0, 'User':1}}).toArray();
    }

    async getUserBySocket(socket){
        let client = this.#connect();
        database = (await client).db(dbName);
        let doc = database.collection('Users');
        return await doc.findOne({Socket:socket}, {projection:{'_id':0, 'User': 1}});
    }

    async getCurrentRoomBySocket(socket){
        let client = this.#connect();
        database = (await client).db(dbName);
        let doc = database.collection('Users');
        return await doc.findOne({Socket:socket}, {projection:{'_id':0, 'Current_Room': 1}});
    }
}

module.exports = DB;
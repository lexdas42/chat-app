
const path = require('path')
const express = require("express")
const http = require('http')
const socketio = require('socket.io')
const { generateMessage, locationMessage} = require('./utils/message')
const {addUser, removeUser, getUser, getUsersRoom} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

 const port = process.env.PORT || 3000

 const publicdirectoriespath = path.join(__dirname, '../public')

 app.use(express.static(publicdirectoriespath))

 io.on("connection", (socket) => {
     console.log("new users is connecting")

       socket.on('join', (options, callback) => {
            const { error, user } = addUser({ id: socket.id, ...options })
        

if (error) {
    return callback(error)
}

        socket.join(user.room)


         socket.emit("message", generateMessage("Admin","Welcome"))
         socket.broadcast.to(user.room).emit("message", generateMessage('Admin',`${user.username} has joined`))
         io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersRoom(user.room)
    })
         callback()

     })

    

socket.on("location", (coords, callback)=> {
    const user = getUser(socket.id)
    io.emit("sendLocation", locationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
    callback()
})

     socket.on('sendMessage', (message, callback) => {
       const user = getUser(socket.id)

         io.to(user.room).emit('message', generateMessage(user.username, message))
         callback()
     })

socket.on('disconnect', () => {
    const user = removeUser(socket.id)

    if (user) {
        io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersRoom(user.room)
        })
    }
})

 })

server.listen(port, () => {
    console.log(`you are on port ${port}`)
})

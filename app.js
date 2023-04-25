import express from 'express'
import { Server } from 'socket.io'

const app = express()
const io = new Server()

let activeUsers = []

io.on('connect', async socket => {

    if (activeUsers.find(u => u === socket.id)) return;

    activeUsers.push(socket.id)

    socket.emit('all-connected-users', activeUsers.filter(u => u !== socket.id))
    socket.broadcast.emit('user-connected', socket.id)

    socket.on('call-request', ({target, offer}) => {
        console.log(`call request from ${socket.id} to ${target}`)
        socket.to(target).emit('call-request', {
            caller: socket.id,
            offer
        })
    })

    socket.on('acknowledge-call', ({caller, answer}) => {
        socket.to(caller).emit('acknowledge-call', {
            from: socket.id,
            answer: answer
        })
    })

    socket.on('disconnect', () => {
        activeUsers = activeUsers.filter(u => u !== socket.id)
        socket.broadcast.emit('user-disconnected', socket.id)
    })
})

const httpServer = app.listen(3000, () => {
    console.log('server running on port 3000')
    io.attach(httpServer)
})
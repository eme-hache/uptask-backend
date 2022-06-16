import { Server } from 'socket.io'
import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'

import projectRouter from './routes/project.routes.js'
import tastkRouter from './routes/task.routes.js'
import userRouter from './routes/user.routes.js'
import corsOptions from './config/cors.js'
import db from './config/db.js'

// Initializing express app
const app = express()

// Server configuration
app.use(cors(corsOptions))
app.use(express.json())
dotenv.config()
db()

// Routing
app.use('/api/project', projectRouter)
app.use('/api/task', tastkRouter)
app.use('/api/user', userRouter)

// Starting server
const PORT = process.env.PORT || 4000
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})

// Socket.io configuration
const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.FRONTEND_URL
    }
})

// Socket.io sockets configuration
io.on('connection', (socket) => {
    socket.on('openProject', (id) => {
        socket.join(id)
    })

    socket.on('newTask', task => {
        const { project } = task
        
        socket.to(project).emit('taskAdded', task)
    })

    socket.on('deleteTask', task => {
        const { project } = task

        socket.to(project).emit('taskDeleted', task)
    })

    socket.on('editTask', task => {
        const { project } = task

        socket.to(project).emit('taskEdited', task)
    })

    socket.on('changeTaskState', task => {
        const { project } = task

        socket.to(project._id).emit('changedTaskState', task)
    })
})
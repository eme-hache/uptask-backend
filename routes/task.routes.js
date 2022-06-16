import express from 'express'

import checkAuth from '../middleware/checkAuth.js'
import {
    changeTaskState,
    deleteTask,
    updateTask,
    addTask,
    getTask,
} from '../controllers/task.controller.js'

const router = express.Router()

router.route('/:id')
    .get(checkAuth, getTask)
    .put(checkAuth, updateTask)
    .delete(checkAuth, deleteTask)

router.post('/', checkAuth, addTask)
router.patch('/state/:id', checkAuth, changeTaskState)

export default router
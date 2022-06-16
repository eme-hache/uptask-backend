import express from 'express'

import checkAuth from '../middleware/checkAuth.js'
import {
    deleteCollaborator,
    getCollaborator,
    addCollaborator,
    deleteProject,
    getProjects,
    editProject,
    getProject,
    newProject,
} from '../controllers/project.controller.js'

const router = express.Router()

router
    .route('/')
    .get(checkAuth, getProjects)
    .post(checkAuth, newProject)

router
    .route('/:id')
    .get(checkAuth, getProject)
    .put(checkAuth, editProject)
    .delete(checkAuth, deleteProject)

router.post('/collaborators', checkAuth, getCollaborator)
router.post('/collaborators/:id', checkAuth, addCollaborator)
router.post('/delete-collaborator/:id', checkAuth, deleteCollaborator)

export default router

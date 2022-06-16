import Project from '../models/Project.js'
import User from '../models/User.js'

export const getProjects = async (req, res) => {
    try {
        const { user } = req

        const projects = await Project.find({
            '$or': [
                { collaborators: { $in: user } },
                { author: { $in: user } }
            ]
        })
            .select('-tasks')

        return res.json(projects)
    }
    catch (error) {
        return res.status(500).json({
            msgToUser: 'Error al obtener los proyectos',
            msg: 'error getting projects',
            error
        })
    }
}

export const getProject = async (req, res) => {
    try {
        const { id } = req.params

        const project = await Project.findOne({ _id: id })
            .populate('collaborators', 'name email')
            .populate({
                path: 'tasks',
                populate: {
                    path: 'completedBy',
                    select: 'name'
                }
            })

        if (!project) {
            return res.status(404).json({
                msgToUser: 'Proyecto no encontrado',
                msg: 'project not found',
                error: true
            })
        }

        const isNotAuthor = project.author.toString() !== req.user._id.toString()
        const isNotCollaborator = !project.collaborators.some(collaborator =>
            collaborator._id.toString() === req.user._id.toString())

        if (isNotAuthor && isNotCollaborator) {
            return res.status(403).send({
                msgToUser: 'Acción no válida',
                msg: 'invalid action',
                error: true
            })
        }

        return res.json({ ...project._doc })
    }
    catch (error) {
        return res.status(500).json({ 
            msgToUser: 'Error al obtener el proyecto',
            msg: 'error getting project',
            error 
        })
    }
}

export const newProject = async (req, res) => {
    try {
        const newProject = new Project(req.body)

        newProject.author = req.user.id

        const savedProject = await newProject.save()

        return res.json(savedProject)
    }
    catch (error) {
        return res.status(500).json({ 
            msgToUser: 'Error al crear el proyecto',
            msg: 'error creating project',
            error
        })
    }
}

export const editProject = async (req, res) => {
    try {
        const { id } = req.params

        const project = await Project.findById(id)
            .where('author')
            .equals(req.user)

        if (!project) {
            return res.status(404).json({ 
                msgToUser: 'Proyecto no encontrado',
                msg: 'project not found',
                error: true
            })
        }

        project.name = req.body.name || project.name
        project.client = req.body.client || project.client
        project.description = req.body.description || project.description
        project.deliveryDate = req.body.deliveryDate || project.deliveryDate

        const savedProject = await project.save()

        return res.json(savedProject)
    }
    catch (error) {
        return res.status(500).json({
            msgToUser: 'Error al editar el proyecto', 
            msg: 'error editing project',
            error
        })
    }
}

export const deleteProject = async (req, res) => {
    try {
        const { id } = req.params

        const project = await Project.findById(id)
            .where('author')
            .equals(req.user)

        if (!project) {
            return res.status(404).json({
                msgToUser: 'Proyecto no encontrado', 
                msg: 'project not found',
                error: true
            })
        }

        await project.deleteOne()

        return res.json({ 
            msgToUser: 'Proyecto eliminado',
            msg: 'project deleted'
        })
    }
    catch (error) {
        return res.status(500).json({ 
            msgToUser: 'Error al eliminar el proyecto',
            msg: 'error deleting project',
            error
        })
    }
}

export const getCollaborator = async (req, res) => {
    try {
        const { email } = req.body

        const user = await User.findOne({ email })
            .select('-password -confirmed -createdAt -updatedAt -token -__v')

        if (!user) {
            return res.status(404).json({ 
                msgToUser: 'Usuario no encontrado',
                msg: 'user not found',
                error: true
            })
        }

        return res.json(user)
    }
    catch (error) {
        return res.status(500).json({ 
            msgToUser: 'Error al obtener el usuario',
            msg: 'error getting user',
            error
        })
    }
}

export const addCollaborator = async (req, res) => {
    try {
        const { email } = req.body
        const { id } = req.params

        const project = await Project.findById(id)

        if (!project) {
            return res.status(404).json({ 
                msgToUser: 'Proyecto no encontrado',
                msg: 'project not found',
                error: true
            })
        }

        if (project.author.toString() !== req.user.id) {
            return res.status(401).send({
                msgToUser: 'Acción no válida',
                msg: 'invalid action',
                error: true
            })
        }

        const user = await User.findOne({ email })
            .select('-password -confirmed -createdAt -updatedAt -token -__v')

        if (!user) {
            return res.status(404).json({ 
                msgToUser: 'Usuario no encontrado',
                msg: 'user not found',
                error: true
            })
        }

        if (project.author.toString() === user._id.toString()) {
            return res.status(409).json({ 
                msgToUser: 'El usuario es el mismo que el autor del proyecto',
                msg: 'user is the same as the author of the project',
                error: true 
            })
        }

        if (project.collaborators.includes(user._id)) {
            return res.status(409).json({ 
                msgToUser: 'El usuario ya es colaborador del proyecto',
                msg: 'user is already a collaborator',
                error: true
            })
        }

        project.collaborators.push(user._id)

        const savedProject = await project.save()

        return res.json(savedProject)
    }
    catch (error) {
        return res.status(500).json({ 
            msgToUser: 'Error al agregar el colaborador',
            msg: 'error adding collaborator',
            error
        })
    }
}

export const deleteCollaborator = async (req, res) => {
    try {
        const { id: collaboratorId } = req.body
        const { id: projectId } = req.params

        const project = await Project.findById(projectId)

        if (!project) {
            return res.status(404).json({ 
                msgToUser: 'Proyecto no encontrado',
                msg: 'project not found',
                error: true
            })
        }

        if (project.author.toString() !== req.user.id) {
            return res.status(401).send({
                msgToUser: 'Acción no válida',
                msg: 'invalid action',
                error: true
            })
        }

        project.collaborators.pull(collaboratorId)

        await project.save()

        return res.json({ 
            msgToUser: 'Colaborador eliminado',
            msg: 'collaborator deleted',
        })
    }
    catch (error) {
        return res.status(500).json({ 
            msgToUser: 'Error al eliminar el colaborador',
            msg: 'error deleting collaborator',
            error
        })
    }
}


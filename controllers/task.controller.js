import Project from '../models/Project.js'
import Task from '../models/Task.js'

export const addTask = async (req, res) => {
    try {
        const { project } = req.body

        const projectExists = await Project.findById(project)
            .where('author')
            .equals(req.user)

        if (!projectExists) {
            return res.status(404).send({
                msgToUser: 'Proyecto no encontrado',
                msg: 'project not found',
                error: true
            })
        }

        const newTask = await Task.create(req.body)

        projectExists.tasks.push(newTask)
        await projectExists.save()

        return res.json(newTask)
    }
    catch (error) {
        return res.status(500).json({
            msgToUser: 'Error al crear la tarea',
            msg: 'error creating task',
            error
        })
    }
}

export const getTask = async (req, res) => {
    try {
        const { id } = req.params

        const task = await Task.find({ id })
            .populate('project')

        if (!task || (task?.project?.author.toString() !== req.user._id.toString())) {
            return res.status(404).send({
                msgToUser: 'Tarea no encontrada',
                msg: 'task not found',
                error: true
            })
        }

        return res.json(task)
    }
    catch (error) {
        return res.status(500).json({
            msgToUser: 'Error al obtener la tarea',
            msg: 'error getting task',
            error
        })
    }
}

export const updateTask = async (req, res) => {
    try {
        const { id } = req.params

        const task = await Task.findById(id)
            .populate('project')

        if (!task || (task.project.author.toString() !== req.user._id.toString())) {
            return res.status(404).send({
                msgToUser: 'Tarea no encontrada',
                msg: 'task not found',
                error: true
            })
        }

        const updatedTask = await Task.findByIdAndUpdate(id, req.body, { new: true })

        return res.json(updatedTask)
    }
    catch (error) {
        return res.status(500).json({
            msgToUser: 'Error al actualizar la tarea',
            msg: 'error updating task',
            error
        })
    }
}

export const deleteTask = async (req, res) => {
    try {
        const { id } = req.params

        const task = await Task.findOne({ _id: id })
            .populate('project')

        if (!task || (task?.project?.author.toString() !== req.user._id.toString())) {
            return res.status(404).send({
                msgToUser: 'Tarea no encontrada',
                msg: 'task not found',
                error: true
            })
        }

        const project = await Project.findById(task.project)

        project.tasks.pull(task._id)

        await project.save()
        await task.deleteOne()

        return res.json({
            msgToUser: 'Tarea eliminada correctamente',
            msg: 'task deleted'
        })
    }
    catch (error) {
        return res.status(500).json({
            msgToUser: 'Error al eliminar la tarea',
            msg: 'error deleting task',
            error
        })
    }
}

export const changeTaskState = async (req, res) => {
    try {
        const { id } = req.params

        const task = await Task.findOne({ _id: id })
            .populate('project')

        if (!task) {
            return res.status(404).send({
                msgToUser: 'Tarea no encontrada',
                msg: 'task not found',
                error: true
            })
        }

        const isNotAuthor = task.project.author.toString() !== req.user._id.toString()
        const isNotCollaborator = !task.project.collaborators.some(collaborator =>
            collaborator.toString() === req.user._id.toString())

        if (isNotAuthor && isNotCollaborator) {
            return res.status(403).send({ 
                msgToUser: 'Acción no válida',
                msg: 'invalid action',
                error: true
            })
        }

        task.completed = !task.completed
        task.completedBy = req.user._id

        if (!task.completed) {
            task.completedBy = null
        }

        const savedTask = await task.save()
            .then(saved => saved.populate('completedBy', 'name'))

        return res.json(savedTask)
    }
    catch (error) {
        return res.status(500).json({ 
            msgToUser: 'Error al cambiar el estado de la tarea',
            msg: 'error changing task state',
            error
        })
    }
}
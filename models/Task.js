import mongoose from 'mongoose'

const taskSchema = mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
    },
    description: {
        type: String,
        trim: true,
        required: true,
    },
    completed: {
        type: Boolean,
        default: false,
    },
    completedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    deliveryDate: {
        type: Date,
        default: Date.now(),
        required: true,
    },
    priority: {
        type: String,
        required: true,
        enum: ['low', 'medium', 'high'],
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
    }
}, {
    timestamps: true,
})

const Task = mongoose.model('Task', taskSchema)

export default Task
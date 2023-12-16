import mongoose from 'mongoose'

const connect = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGO_URI)

        const url = `${connection.connection.host}: ${connection.connection.port}`
        console.log(`Connected to ${url}`)
    }
    catch (error) {
        console.log(`Error: ${error.message}`)
        process.exit(1)
    }
}

export default connect
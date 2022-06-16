import User from '../models/User.js'
import jwt from 'jsonwebtoken'

const checkAuth = async (req, res, next) => {
    try {
        const { authorization } = req.headers
    
        if (!authorization) {
            return res.status(401).json({ msg: 'Unauthorized' })
        }
    
        const token = authorization.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        req.user = await User.findById(decoded.id).select('-password -confirmed -token -createdAt -updatedAt -__v')

        return next()
    }
    catch (error) {
        return res.status(401).json({ 
            msgToUser: 'No autorizado',
            msg: 'unauthorized',
            error
        })
    }
}

export default checkAuth
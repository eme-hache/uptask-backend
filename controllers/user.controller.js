import {
    sendForgotPasswordEmail,
    sendConfirmationEmail,
} from '../helpers/email.js'
import generateJWT from '../helpers/generateJWT.js'
import generateID from '../helpers/generateID.js'
import User from '../models/User.js'

export const signUp = async (req, res) => {
    try {
        const { email } = req.body
        const userExists = await User.findOne({ email })

        if (userExists) {
            return res.status(409).json({
                msgToUser: 'El usuario ya se encuentra registrado',
                msg: 'user already exists',
                error: true
            })
        }

        const user = new User(req.body)
        user.token = generateID()

        await user.save()

        sendConfirmationEmail({ email: user.email, name: user.name, token: user.token })

        return res.json({
            msgToUser: 'Usuario creado correctamente, revisa tu email para confirmar tu cuenta',
            msg: 'user created'
        })
    }
    catch (error) {
        return res.status(500).json({
            msgToUser: 'Error al crear el usuario',
            msg: 'error signing up',
            error
        })
    }
}

export const signIn = async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await User.findOne({ email })

        if (!user) {
            return res.status(404).json({
                msgToUser: 'Usuario no encontrado',
                msg: 'user not found',
                error: true,
            })
        }

        if (!user.confirmed) {
            return res.status(401).json({
                msgToUser: 'El usuario no ha confirmado su cuenta',
                msg: 'User not confirmed',
                error: true,
            })
        }

        if (await user.isValidPassword(password)) {
            return res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateJWT(user._id)
            })
        }
        else {
            return res.status(401).json({ 
                msgToUser: 'Usuario o contraseña incorrectos',
                msg: 'user or password incorrect',
                error: true
            })
        }
    }
    catch (error) {
        return res.status(500).json({
            msgToUser: 'Error al iniciar sesión',
            msg: 'error signing in',
            error
        })
    }
}

export const confirmUser = async (req, res) => {
    try {
        const { token } = req.params

        const user = await User.findOne({ token })

        if (!user) {
            return res.status(404).json({
                msgToUser: 'El token no es válido',
                msg: 'Invalid token',
                error: true
            })
        }

        user.confirmed = true
        user.token = ''

        await user.save()

        return res.json({
            msgToUser: 'Cuenta confirmada correctamente',
            msg: 'account confirmed',
        })
    }
    catch (error) {
        return res.status(500).json({
            msgToUser: 'Error al confirmar la cuenta',
            msg: 'error confirming account',
            error
        })
    }
}

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body

        const user = await User.findOne({ email })

        if (!user) {
            return res.status(404).json({
                msgToUser: 'Usuario no encontrado',
                msg: 'user not found',
                error: true,
            })
        }

        user.token = generateID()

        await user.save()

        sendForgotPasswordEmail({
            email: user.email,
            name: user.name,
            token: user.token
        })

        return res.json({
            msgToUser: 'Se ha enviado un email para restablecer la contraseña',
            msg: 'reset password email sent',
        })
    }
    catch (error) {
        return res.status(500).json({
            msgToUser: 'Error enviando el email para restablecer la contraseña',
            msg: 'error sending reset password email',
            error
        })
    }
}

export const checkToken = async (req, res) => {
    try {
        const { token } = req.params

        const user = await User.findOne({ token })

        if (user) {
            return res.json({
                msgToUser: 'El token es válido',
                msg: 'valid token',
                validToken: true,
            })
        }
        else {
            return res.status(404).json({
                msgToUser: 'El token no es válido',
                msg: 'invalid token',
                validToken: false,
            })
        }
    }
    catch (error) {
        return res.status(500).json({
            msgToUser: 'Error al comprobar el token',
            msg: 'error checking token',
            error
        })
    }
}

export const resetPassword = async (req, res) => {
    try {
        const { password } = req.body
        const { token } = req.params

        const user = await User.findOne({ token })

        if (!user) {
            res.status(404).json({
                msgToUser: 'El token no es válido',
                msg: 'Invalid token',
                error: true
            })
        }

        user.token = ''
        user.password = password

        await user.save()

        return res.json({
            msgToUser: 'Contraseña restablecida correctamente',
            msg: 'Password reset'
        })
    }
    catch {
        return res.status(500).json({
            msgToUser: 'Error al restablecer la contraseña',
            msg: 'error resetting password',
            error
        })
    }
}

export const profile = async (req, res) => {
    return res.json(req.user)
}
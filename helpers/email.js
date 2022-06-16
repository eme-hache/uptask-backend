import nodemailer from 'nodemailer'

export const sendConfirmationEmail = async data => {
    const { email, name, token } = data

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    })

    await transport.sendMail({
        from: 'UpTask - Administrador de Proyectos <cuentas@uptask.com>',
        to: email,
        subject: 'UpTask - Confirmación de cuenta',
        text: 'Comprueba tu cuenta en UpTask',
        html: `
            <p>Hola ${name}, confirma tu cuenta en UpTask</p>
            <p>Para confirmar tu cuenta haz click en el siguiente enlace:</p>

            <a href="${process.env.FRONTEND_URL}/confirm/${token}">Confirmar cuenta</a>

            <p>Si no has solicitado una cuenta en UpTask, puedes ignorar este email.</p>
      `
    })
}

export const sendForgotPasswordEmail = async data => {
    const { email, name, token } = data

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    })

    await transport.sendMail({
        from: 'UpTask - Administrador de Proyectos <cuentas@uptask.com>',
        to: email,
        subject: 'UpTask - Reestablece tu Contraseña',
        text: 'Reestablece tu contraseña en UpTask',
        html: `
            <p>Hola ${name}, has solicitado reestablecer tu contraseña en UpTask</p>
            <p>Sigue el siguiente enlace para generar una nueva contraseña:</p>

            <a href="${process.env.FRONTEND_URL}/forgot-password/${token}">Reestablecer contraseña</a>

            <p>Si no has solicitado reestablecer tu contraseña en UpTask, puedes ignorar este email.</p>
      `
    })
}
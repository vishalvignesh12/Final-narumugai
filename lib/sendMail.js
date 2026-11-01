import nodemailer from 'nodemailer'
export const sendMail = async (subject, receiver, body) => {
    const missingSettings = ['NODEMAILER_HOST', 'NODEMAILER_PORT', 'NODEMAILER_EMAIL', 'NODEMAILER_PASSWORD']
        .filter(name => !process.env[name]?.trim())
    if (missingSettings.length) {
        console.error(`Email delivery is not configured. Missing: ${missingSettings.join(', ')}`)
        return { success: false, message: 'Email delivery is not configured.' }
    }

    const trasporter = nodemailer.createTransport({
        host: process.env.NODEMAILER_HOST,
        port: process.env.NODEMAILER_PORT,
        secure: process.env.NODEMAILER_SECURE === 'true', // Convert string to boolean
        auth: {
            user: process.env.NODEMAILER_EMAIL,
            pass: process.env.NODEMAILER_PASSWORD,
        }
    })

    const options = {
        from: `"Narumugai" <${process.env.NODEMAILER_EMAIL}>`,
        to: receiver,
        subject: subject,
        html: body
    }

    try {
        await trasporter.sendMail(options)
        return { success: true }
    } catch (error) {
        console.error('Email sending error:', error.message);
        console.error('SMTP Configuration Error Details:', {
            host: process.env.NODEMAILER_HOST,
            port: process.env.NODEMAILER_PORT,
            secure: process.env.NODEMAILER_SECURE,
            user: process.env.NODEMAILER_EMAIL ? '[SET]' : '[NOT SET]',
            password: process.env.NODEMAILER_PASSWORD ? '[SET]' : '[NOT SET]'
        });
        return { success: false, message: error.message, error: error }
    }

}

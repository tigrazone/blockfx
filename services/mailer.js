const nodemailer = require('nodemailer');
const log = require('./logger');

class Mailer {
    getTransporter(){
        if(!this.transporter){
            this.transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.GMAIL_LOGIN, //TODO: Change email.
                    pass: process.env.GMAIL_APPLICATION_PASSWORD
                }
            });
        }
        return this.transporter;
    }

    sendMailToAdmin(subject, text, callback){
        const mailOptions = {
            from: process.env.FROM_EMAIL, // sender address
            to: process.env.ADMIN_EMAIL, // list of receivers
            subject, // Subject line
            text
        };

        log.info('Mail Options:');
        log.info(mailOptions);

        this.getTransporter().sendMail(mailOptions, callback);
    }
}

module.exports = mailer = new Mailer();
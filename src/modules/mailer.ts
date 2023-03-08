import nodemailer from 'nodemailer'
import jwt from 'jsonwebtoken'
import auth from '../config/auth'

const mailerConfig = {
    
    async mailer(token: string) {
        // let testAccount = await nodemailer.createTestAccount();
        const decoded = jwt.decode(token) as jwt.JwtPayload     

    // create reusable transporter object using the default SMTP transport
        // let transporter = nodemailer.createTransport({
        //     host: "smtp.ethereal.email",
        //     port: 587,
        //     secure: false, // true for 465, false for other ports
        //     auth: {
        //         user: testAccount.user, // generated ethereal user
        //         pass: testAccount.pass, // generated ethereal password
        //     },
        // });
        let transporter = nodemailer.createTransport({
            host: auth.email_host,
            port: auth.email_port,
            auth: {
              user: auth.email_user,
              pass: auth.email_pass
            }
          });

        let info = await transporter.sendMail({
            from: '"Bergamotta" <bergamotta@contato.com.br>', // sender address
            to: "cliente@email.com.br", // list of receivers
            subject: "Olá", // Subject line
            text: "Segue abaixo token: " + token, // plain text body
            html: `<h1> Olá, ${decoded.name}! </h1>
            <p> Você recebeu uma nova senha gerada automaticamente que expira em <b>20 minutos.</b> </p>
            <p> Nova senha: <b>${decoded.passwordReset}</b></p>
            <p> Para criar sua própria senha, clique no link abaixo: </p>
            <a href= "http://localhost:4000/users/reset-password/${decoded.id}/${token}"><b>Criar nova senha</b></a>`, // html body
        });
        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
}

export { mailerConfig };
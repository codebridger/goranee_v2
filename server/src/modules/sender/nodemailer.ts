const nodemailer = require("nodemailer");

export const smtpTransport = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  auth: {
    user: process.env.GMAIL_SENDER_USER,
    pass: process.env.GMAIL_SENDER_PASSWORD_APP,
  },
});

// let mailOption = {
//     to: 'nc_bomfunk@yahoo.com',
//     subject: 'nodemailer test',
//     text: 'this is a test'
// }

// smtpTransport.sendMail(mailOption, (error, info) => {
//     if (error) {
//         debugger
//     }
//     else {
//         debugger
//     }
// })

/**
 * message:'Invalid login: 534-5.7.9 Application-specific password required.
 * Learn more at\n534 5.7.9
 * https://support.google.com/mail/?p=InvalidSecondFactor n2sm13959329ejl.1 - gsmtp'
 */

// exports.send(email)

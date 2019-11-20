const nodemailer = require('nodemailer');

const APP_HOST = process.env.APP_HOST || 'http://localhost:3000'

const user = process.env.MAIL_USER
const pass = process.env.MAIL_PASS

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user, pass }
});

module.exports.sendValidateEmail = (toCreateUser) => {
  transporter.sendMail({
    from: `"Auth-Example 👻" <${user}>`,
    to: toCreateUser.email,
    subject: 'Welcome to auth-example!',
    html: `
      <h1>Welcome</h1>
      <a href='${APP_HOST}/users/${toCreateUser.validateToken}/validate'>Confirm account</a>
    `
  })
    .then(info => console.log(info))
    .catch(error => console.log(error))
}
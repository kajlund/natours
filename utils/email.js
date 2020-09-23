const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) Create a transporter
  // const transporter = nodemailer.createTransport({
  //   service: 'Sendgrid',
  //   auth: {
  //     user: process.env.EMAIL_USERNAME,
  //     password: process.env.EMAIL_PASSWORD,
  //   },
  // });
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2) Define email options
  const mailOptions = {
    from: 'kajlund.com <noreply@kajlund.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    //html:
  };

  // 3) Send the email
  await transport.sendMail(mailOptions);
};

module.exports = sendEmail;

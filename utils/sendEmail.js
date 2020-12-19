const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: `"${process.env.FROM_NAME}" ${process.env.FROM_EMAIL}`,
    to: `${options.name}, ${options.email}`,
    subject: `${options.subject}`,
    text: `${options.message}`,
  });

  console.log("Message sent: %s", info.messageId);
};

module.exports = sendEmail;

import nodemailer from "nodemailer";

// SEND EMAIL USING SMTP AND NODEMAILER
const sendEmail = async (option) => {
  // Create the transporter using SMTP settings
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // Define the email message
  const message = {
    from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
    to: option.email,
    subject: option.subject,
    html: option.message,
  };

  // Send the email
  await transport.sendMail(message);
};

export default sendEmail;

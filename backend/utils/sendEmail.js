const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Tạo transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2. Định nghĩa options
  const mailOptions = {
    from: `"DevManager Support" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: options.html // Nếu muốn gửi HTML đẹp thì dùng cái này sau
  };

  // 3. Gửi mail
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
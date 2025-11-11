import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, htmlContent) => {
  try {
    // 🟢 Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail", // or 'outlook', 'yahoo', or custom SMTP
      auth: {
        user: process.env.EMAIL_USER, // your email
        pass: process.env.EMAIL_PASS, // your app password
      },
    });

    // 🟢 Email options
    const mailOptions = {
      from: `"Edulists" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    };

    // 🟢 Send mail
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);
    return info;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw new Error("Email sending failed");
  }
};

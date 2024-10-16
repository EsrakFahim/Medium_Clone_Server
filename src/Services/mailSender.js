import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVICE, // mail.privateemail.com for Namecheap
      port: process.env.EMAIL_PORT, // Ensure this is a number
      secure: process.env.EMAIL_SECURE, // true for SSL, false for TLS
      auth: {
            user: process.env.EMAIL_ACCOUNT, // Your Namecheap email
            pass: process.env.EMAIL_PASSWORD, // Your email password
      },
});

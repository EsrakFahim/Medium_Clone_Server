export const sendVerificationEmail = async (userEmail, token) => {
      const verificationUrl = `${process.env.SITE_ORIGIN_LOCAL}/verify-email/${token}`;

      const mailOptions = {
            from: process.env.EMAIL_ACCOUNT,
            to: userEmail,
            subject: "Verify Your Email Address",
            html: `
                  <h1>Email Verification</h1>
                  <p>Thank you for registering! Please verify your email by clicking the link below:</p>
                  <a href="${verificationUrl}">Verify Email</a>
                  <p>If you did not request this, please ignore this email.</p>
            `,
      };
      return mailOptions;
};

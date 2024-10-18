const otpMainConfig = ({ otp, userEmail }) => {
      const mailOption = {
            from: process.env.EMAIL_ACCOUNT,
            to: userEmail,
            subject: "Reset Your Password",
            html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <div style="text-align: center;">
                  <h2 style="color: #007BFF;">Reset Your Password</h2>
            </div>
            <p style="font-size: 16px; color: #333;">
                  Hello,
            </p>
            <p style="font-size: 16px; color: #333;">
                  You requested to reset your password. Please use the following One-Time Password (OTP) to reset your password. This OTP is valid for <strong>15 minutes</strong>.
            </p>
            <div style="text-align: center; margin: 20px 0;">
                  <span style="display: inline-block; padding: 10px 20px; font-size: 24px; font-weight: bold; color: #fff; background-color: #007BFF; border-radius: 5px;">
                        ${otp}
                  </span>
            </div>
            <p style="font-size: 16px; color: #333;">
                  If you did not request a password reset, please ignore this email.
            </p>
            <p style="font-size: 16px; color: #333;">
                  Thank you,
                  <br />
                  The Team
            </p>
            <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #888;">
                  <p>
                        © 2024 Your Company. All rights reserved.
                  </p>
            </div>
      </div>
      `,
      };

      return mailOption;
};

export { otpMainConfig };

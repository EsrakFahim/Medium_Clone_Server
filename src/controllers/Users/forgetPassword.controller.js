import { asyncHandler } from "../../utils/asyncHandler.js";
import { apiResponse } from "../../utils/apiResponse.js";
import { apiErrorHandler } from "../../utils/apiErrorHandler.js";
import { User } from "../../models/user.model.js";
import { generateOTP } from "../../Services/OtpGenerator.js";
import { otpMainConfig } from "../../utils/otpMailConfig.js";
import { transporter } from "../../Services/mailSender.js";
import bcrypt from "bcrypt"; // For secure password hashing

const forgetPassword = asyncHandler(async (req, res, next) => {
      const { email } = req.body;

      if (!email) {
            return next(new apiErrorHandler(400, "Email is required"));
      }

      const user = await User.findOne({ email }).lean(); // Use .lean() to improve performance

      if (!user) {
            return next(new apiErrorHandler(404, "User not found"));
      }

      // Generate OTP and calculate expiry
      const otp = generateOTP();
      const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

      // Update OTP and expiry in a single DB operation
      await User.updateOne({ email }, { otp, otpExpiry });

      // Send OTP email asynchronously (non-blocking)
      transporter
            .sendMail(otpMainConfig({ otp, userEmail: email }))
            .catch((err) => console.error("Error sending OTP email:", err));

      // Send response immediately without waiting for the email operation
      res.status(200).json(new apiResponse(200, {}, `OTP sent to ${email}`));
});

const resetPassword = asyncHandler(async (req, res, next) => {
      const { otp, newPassword, confirmPassword, userEmail } = req.body;

      if (!otp || !newPassword || !confirmPassword) {
            return next(new apiErrorHandler(400, "All fields are required"));
      }

      if (newPassword !== confirmPassword) {
            return next(new apiErrorHandler(400, "Passwords do not match"));
      }

      const user = await User.findOne({ email: userEmail });

      if (!user) {
            return next(new apiErrorHandler(404, "User not found"));
      }

      // Check if OTP is valid and not expired
      if (user.otp !== otp || user.otpExpiry < Date.now()) {
            // Clear OTP fields if expired or invalid
            user.otp = null;
            user.otpExpiry = null;
            await user.save({ validateBeforeSave: false });

            return next(new apiErrorHandler(400, "Invalid or expired OTP"));
      }

      // Hash the new password securely
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password and clear OTP in a single DB operation
      await User.updateOne(
            { email: userEmail },
            { password: hashedPassword, otp: null, otpExpiry: null }
      );

      res.status(200).json(
            new apiResponse(200, {}, "Password reset successful")
      );
});

export { forgetPassword, resetPassword };

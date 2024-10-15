import { asyncHandler } from "../../utils/asyncHandler.js";
import { apiResponse } from "../../utils/apiResponse.js";
import { apiErrorHandler } from "../../utils/apiErrorHandler.js";
import { User } from "../../models/user.model.js";
import { generateOTP } from "../../Services/OtpGenerator.js";
import { otpMainConfig } from "../../utils/otpMailConfig.js";
import { transporter } from "../../Services/mailSender.js";

const forgetPassword = asyncHandler(async (req, res, next) => {
      try {
            const { userEmail } = req.body;

            if (!userEmail) {
                  throw new apiErrorHandler(400, "Email is required");
            }

            const user = await User.findOne({ userEmail });

            if (!user) {
                  throw new apiErrorHandler(404, "User not found");
            }

            // Generate OTP
            const otp = generateOTP();
            const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

            // Save OTP and expiry in database
            user.otp = otp;
            user.otpExpiry = otpExpiry;
            await user.save(
                  { validateBeforeSave: false } // Skip validation
            );

            // Send email with reset password link
            const mailOption = otpMainConfig({ otp, userEmail });
            await transporter.sendMail(mailOption);

            return res
                  .status(200)
                  .json(new apiResponse(200, {}, `OTP sent to ${userEmail}`));
      } catch (error) {
            console.error("Forget Password Error: ", error);
            throw new apiErrorHandler(500, "Internal Server Error");
      }
});

const resetPassword = asyncHandler(async (req, res, next) => {
      const { otp, newPassword, confirmPassword, userEmail } = req.body;

      if (!otp || !newPassword || !confirmPassword) {
            throw new apiErrorHandler(400, "All fields are required");
      }

      if (newPassword !== confirmPassword) {
            throw new apiErrorHandler(
                  400,
                  "Your confirm password does not match"
            );
      }

      const user = await User.findOne({ userEmail });

      if (!user) {
            throw new apiErrorHandler(404, "User not found");
      }

      if (user.otpExpiry < Date.now()) {
            otp = null;
            otpExpiry = null;
            await user.save({ validateBeforeSave: false });
            throw new apiErrorHandler(400, "Bad request", "OTP expired");
      }

      const checkOtp = await user.isOtpCorrect(otp);

      if (!checkOtp) {
            throw new apiErrorHandler(400, "Invalid OTP");
      }

      user.userPassword = newPassword;
      user.otp = null;
      user.otpExpiry = null;
      await user.save({ validateBeforeSave: false });

      return res
            .status(200)
            .json(new apiResponse(200, {}, "Password reset successful"));
});

export { forgetPassword, resetPassword };

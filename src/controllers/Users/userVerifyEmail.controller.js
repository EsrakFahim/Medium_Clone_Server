import { User } from "../../models/user.model.js";
import { apiErrorHandler } from "../../utils/apiErrorHandler.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const verifyEmail = asyncHandler(async (req, res, next) => {
      const { token } = req.params;

      // Find the user with the matching email verification token
      const user = await User.findOne({ emailVerificationToken: token });

      if (!user) {
            throw new apiErrorHandler(
                  400,
                  "Invalid or expired verification token"
            );
      }

      // Activate the user account
      user.isVerified = true;
      user.emailVerificationToken = undefined; // Remove the token after verification
      await user.save();

      return res.status(200).json({
            message: "Email verified successfully. You can now log in.",
      });
});

export { verifyEmail };

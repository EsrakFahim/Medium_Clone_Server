import { asyncHandler } from "../../utils/asyncHandler.js";
import { apiErrorHandler } from "../../utils/apiErrorHandler.js";
import { apiResponse } from "../../utils/apiResponse.js";
import { User } from "../../models/user.model.js";
import { generateToken } from "../../Function/generateToken.js";

const loginUser = asyncHandler(async (req, res, next) => {
      const { email, password } = req.body;

      // Validate input
      if (!email?.trim() || !password?.trim()) {
            throw new apiErrorHandler(400, "Email and Password are required");
      }

      // Find user by email with password included
      const user = await User.findOne({
            $or: [{ email }],
      }).select("+password");

      if (!user) {
            throw new apiErrorHandler(404, "User not found");
      }

      // Verify the password
      const isPasswordMatch = await user.isPasswordCorrect(password);
      console.log(isPasswordMatch);
      if (!isPasswordMatch) {
            throw new apiErrorHandler(400, "Invalid credentials");
      }

      // Ensure the account is active
      if (user.status !== "active") {
            throw new apiErrorHandler(403, "Account is not active");
      }

      // Ensure the email is verified
      if (!user.isVerified) {
            throw new apiErrorHandler(403, "Please verify your email");
      }

      // Generate access and refresh tokens
      const { accessToken, refreshToken } = await generateToken(user._id);

      if (!accessToken || !refreshToken) {
            throw new apiErrorHandler(
                  500,
                  "Failed to generate authentication tokens"
            );
      }

      // Update the user's last login date and refresh token
      user.lastLogin = new Date();
      user.refreshToken = refreshToken;
      await user.save({
            validateBeforeSave: false,
      });

      // Select fields to return in the response
      const loggedInUser = await User.findById(user._id).select(
            "-password -emailVerificationToken -resetPasswordToken -resetPasswordExpires"
      );

      const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Only secure in production
            sameSite: "Strict",
      };

      // Send cookies and JSON response
      return res
            .status(200)
            .cookie("refreshToken", refreshToken, {
                  ...cookieOptions,
                  maxAge: 7 * 24 * 60 * 60 * 1000,
            }) // 7 days
            .cookie("accessToken", accessToken, {
                  ...cookieOptions,
                  maxAge: 15 * 60 * 1000,
            }) // 15 minutes
            .json(
                  new apiResponse(
                        200,
                        { user: loggedInUser, accessToken },
                        "Login successful"
                  )
            );
});

const logoutUser = asyncHandler(async (req, res, next) => {
      const { user } = req;

      console.log(user);

      if (!user) {
            throw new apiErrorHandler(401, "Not authenticated");
      }

      // Clear refresh token from the user's record
      await User.findByIdAndUpdate(user._id, { refreshToken: "" });

      const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Only secure in production
            sameSite: "Strict",
      };

      // Clear cookies and return a success message
      return res
            .status(200)
            .clearCookie("refreshToken", cookieOptions)
            .clearCookie("accessToken", cookieOptions)
            .json(new apiResponse(200, {}, "Logout successful"));
});

export { loginUser, logoutUser };

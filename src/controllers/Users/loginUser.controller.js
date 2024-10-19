import { asyncHandler } from "../../utils/asyncHandler.js";
import { apiErrorHandler } from "../../utils/apiErrorHandler.js";
import { apiResponse } from "../../utils/apiResponse.js";
import { User } from "../../models/user.model.js";
import { generateToken } from "../../Function/generateToken.js";

const loginUser = asyncHandler(async (req, res, next) => {
      const { email, password } = req.body;

      if (!email?.trim() || !password?.trim()) {
            throw new apiErrorHandler(400, "Email and Password are required");
      }

      const user = await User.findOne({ email }).select("+password");

      if (!user || !(await user.isPasswordCorrect(password))) {
            throw new apiErrorHandler(400, "Invalid credentials");
      }

      if (user.status !== "active") {
            throw new apiErrorHandler(403, "Account is not active");
      }

      if (!user.isVerified) {
            throw new apiErrorHandler(403, "Please verify your email");
      }

      const { accessToken, refreshToken } = await generateToken(user._id);

      user.lastLogin = new Date();
      user.refreshToken = refreshToken;
      await user.save({ validateBeforeSave: false });

      const loggedInUser = await User.findById(user._id).select(
            "-password -emailVerificationToken -resetPasswordToken -resetPasswordExpires"
      );

      const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      };

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

      if (!user) {
            throw new apiErrorHandler(401, "Not authenticated");
      }

      await User.findByIdAndUpdate(user._id, { refreshToken: "" });

      const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      };

      return res
            .status(200)
            .clearCookie("refreshToken", cookieOptions)
            .clearCookie("accessToken", cookieOptions)
            .json(new apiResponse(200, {}, "Logout successful"));
});

export { loginUser, logoutUser };

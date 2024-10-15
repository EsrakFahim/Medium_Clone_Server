import { asyncHandler } from "../../utils/asyncHandler.js";
import { apiErrorHandler } from "../../utils/apiErrorHandler.js";
import { apiResponse } from "../../utils/apiResponse.js";
import { User } from "../../models/user.model.js";
import { generateToken } from "../../Function/generateToken.js";

const loginUser = asyncHandler(async (req, res, next) => {
      const { userName, userEmail, userPhone, userPassword } = req?.body;

      if (
            [userName, userEmail, userPassword, userPhone].some(
                  (field) => field?.trim() === ""
            )
      ) {
            throw new apiErrorHandler(400, "All fields are required");
      }

      const user = await User.findOne({
            $or: [{ userName }, { userEmail }],
      });

      if (!user) {
            throw new apiErrorHandler(404, "User not found");
      }

      const isPasswordMatch = await user.isPasswordCorrect(userPassword);

      if (!isPasswordMatch) {
            throw new apiErrorHandler(400, "Invalid credentials");
      }

      const { accessToken, refreshToken } = await generateToken(user?._id);
      console.log(refreshToken, accessToken);

      if (!refreshToken || !accessToken) {
            throw new apiErrorHandler(500, "Internal server error");
      }

      const loggedInUser = await User.findOne({ _id: user?._id }).select(
            "-userPassword -otp -otpExpiry -refreshToken -accessToken"
      );

      const option = {
            httpOnly: true,
            secure: true,
      };

      return res
            .status(200)
            .cookie("refreshToken", refreshToken, option)
            .cookie("accessToken", accessToken, option)
            .json(
                  new apiResponse(
                        200,
                        { user: loggedInUser, accessToken },
                        "Login successful"
                  )
            );
});

const logoutUser = asyncHandler(async (req, res, next) => {
      const userLogout = await User.findByIdAndUpdate(
            req?.user?._id,
            {
                  $set: {
                        refreshToken: "",
                        accessToken: "",
                  },
            },
            {
                  new: true,
            }
      );

      console.log("from logout", userLogout);

      if (!userLogout) {
            throw new apiErrorHandler(500, "Internal server error");
      }

      const option = {
            httpOnly: true,
            secure: true,
      };

      return res
            .status(200)
            .clearCookie("refreshToken", option)
            .clearCookie("accessToken", option)
            .json(new apiResponse(200, {}, "Logout successful"));
});

export { loginUser, logoutUser };

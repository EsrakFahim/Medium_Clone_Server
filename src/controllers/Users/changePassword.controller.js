import { asyncHandler } from "../../utils/asyncHandler.js";
import { apiErrorHandler } from "../../utils/apiErrorHandler.js";
import { apiResponse } from "../../utils/apiResponse.js";
import { User } from "../../models/user.model.js";

const changePassword = asyncHandler(async (req, res, next) => {
      const { userEmail } = req?.user;
      const { oldPassword, newPassword, confirmPassword } = req.body;

      if (!oldPassword || !newPassword || !confirmPassword) {
            throw new apiErrorHandler(400, "All fields are required");
      }

      if (newPassword !== confirmPassword) {
            throw new apiErrorHandler(
                  400,
                  "Password and confirm password do not match"
            );
      }

      const user = await User.findOne({ userEmail });

      if (!user) {
            throw new apiErrorHandler(404, "User not found");
      }

      const checkPassword = await user.isPasswordCorrect(oldPassword);

      if (!checkPassword) {
            throw new apiErrorHandler(400, "Invalid password");
      }

      if (oldPassword === newPassword) {
            throw new apiErrorHandler(
                  400,
                  "New password cannot be the same as old password"
            );
      }

      user.userPassword = newPassword;
      await user.save();

      return res
            .status(200)
            .json(new apiResponse(200, {}, "Password changed successfully"));
});

export { changePassword };

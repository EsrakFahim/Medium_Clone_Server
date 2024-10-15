import { User } from "../../models/user.model.js";
import { apiErrorHandler } from "../../utils/apiErrorHandler.js";
import { apiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const deleteAccount = asyncHandler(async (req, res, next) => {
      const { userEmail: userMainEmail, _id } = req?.user;
      const { userEmail, UserPassword } = req.body;

      if (!userEmail || !UserPassword) {
            throw new apiErrorHandler(400, "All fields are required");
      }

      if (userEmail !== userMainEmail) {
            throw new apiErrorHandler(401, "Unauthorized email");
      }

      const user = await User.findOne({ userEmail, _id });

      if (!user) {
            throw new apiErrorHandler(404, "User not found");
      }

      const checkPassword = await user.isPasswordCorrect(UserPassword);

      if (!checkPassword) {
            throw new apiErrorHandler(400, "Invalid password");
      }

      await User.findByIdAndDelete(_id);

      return res
            .status(200)
            .json(new apiResponse(200, {}, "Account deleted successfully"));
});

export { deleteAccount };

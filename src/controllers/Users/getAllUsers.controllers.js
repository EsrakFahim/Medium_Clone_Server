import { asyncHandler } from "../../utils/asyncHandler.js";
import { apiErrorHandler } from "../../utils/apiErrorHandler.js";
import { apiResponse } from "../../utils/apiResponse.js";
import { User } from "../../models/user.model.js";

const getAllUsers = asyncHandler(async (req, res, next) => {
      const users = await User.find();

      if (!users) {
            return apiErrorHandler(res, "No users found", 404);
      }

      return res
            .status(200)
            .json(
                  new apiResponse(200, users, "All users fetched successfully")
            );
});

export { getAllUsers };

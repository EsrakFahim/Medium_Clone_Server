import { User } from "../models/user.model.js";
import { apiErrorHandler } from "../utils/apiErrorHandler.js";

const generateToken = async (user_id) => {
      try {
            const user = await User.findOne({ _id: user_id });
            const accessToken = await user.generateAccessToken();
            const refreshToken = await user.generateRefreshToken();

            console.log("from token generator", refreshToken, accessToken);

            user.refreshToken = refreshToken;
            user.accessToken = accessToken;
            await user.save({ validateBeforeSave: false });

            return { accessToken, refreshToken };
      } catch (error) {
            console.log("from token generator", error);
            throw new apiErrorHandler(500, "Internal server error");
      }
};

export { generateToken };

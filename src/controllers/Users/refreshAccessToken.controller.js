import { asyncHandler } from "../../utils/asyncHandler.js";
import { apiErrorHandler } from "../../utils/apiErrorHandler.js";
import { apiResponse } from "../../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import { generateToken } from "../../Function/generateToken.js";
import { User } from "../../models/user.model.js";

const refreshAccessToken = asyncHandler(async (req, res, next) => {
      const previousRefreshToken =
            req?.cookies?.refreshToken || req?.body?.refreshToken;

      if (!previousRefreshToken) {
            throw new apiErrorHandler(res, "No refresh token provided", 401);
      }

      try {
            const decodedToken = jwt.verify(
                  previousRefreshToken,
                  process.env.REFRESH_TOKEN_SECRET
            );

            const user = await User.findById(decodedToken?._id);

            if (!user) {
                  throw new apiErrorHandler(res, "User not found", 404);
            }

            console.log(
                  "user.refreshToken:",
                  user.refreshToken,
                  "previousRefreshToken:",
                  previousRefreshToken
            );

            if (user.refreshToken !== previousRefreshToken) {
                  throw new apiErrorHandler(res, "Invalid refresh token", 401);
            }

            const option = {
                  httpOnly: true,
                  secure: true,
            };

            const { accessToken, refreshToken } = await generateToken(user._id);

            return res
                  .status(200)
                  .cookie("refreshToken", refreshToken, option)
                  .cookie("accessToken", accessToken, option)
                  .json(
                        new apiResponse(
                              200,
                              "Successfully refreshed access token",
                              { accessToken }
                        )
                  );
      } catch (error) {
            console.log("error from refreshAccessToken", error);
            throw new apiErrorHandler(res, "Invalid refresh token", 401);
      }
});

export { refreshAccessToken };

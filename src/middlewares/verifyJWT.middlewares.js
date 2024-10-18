import { User } from "../models/user.model.js";
import { apiErrorHandler } from "../utils/apiErrorHandler.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

const verifyJWT = asyncHandler(async (req, res, next) => {
      try {
            const token =
                  req?.cookies?.accessToken ||
                  req?.header("authorization")?.replace("Bearer ", "");

            console.log("Token From JWT", token);

            if (!token) {
                  throw new apiErrorHandler(401, "Unauthorized token");
            }

            const decodedToken = jwt.verify(
                  token,
                  process.env.ACCESS_TOKEN_SECRET
            );

            console.log("decodedToken:", decodedToken);

            const user = await User.findById(decodedToken?._id).select(
                  "-password  -refreshToken -accessToken"
            );

            if (!user) {
                  throw new apiErrorHandler(401, "unauthorized user");
            }

            req.user = user;
            next();
      } catch (error) {
            console.log("error from jwt auth:", error);
            throw new apiErrorHandler(401, "Unauthorized");
      }
});

export { verifyJWT };

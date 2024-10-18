import { Router } from "express";
import { upload } from "../middlewares/multer.middlewares.js";
import { registerUser } from "../controllers/Users/registerUser.controller.js";
import {
      loginUser,
      logoutUser,
} from "../controllers/Users/loginUser.controller.js";
import { verifyJWT } from "../middlewares/verifyJWT.middlewares.js";

const router = Router();

// router.route("/").get(getAllUsers); // GET /api/users
// router.route("/:_id").get(getSingleUser); // GET /api/users/:_id
router.route("/register").post(
      upload.fields([
            {
                  name: "profilePicture", // The key expected in the form data
                  maxCount: 1, // Limits the number of files to 1
            },
      ]),
      registerUser
);
router.route("/login").post(loginUser); // POST /api/users/
router.route("/logout").get(verifyJWT, logoutUser); // GET /api/users/logout

export default router;

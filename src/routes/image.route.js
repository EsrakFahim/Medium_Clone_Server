import { Router } from "express";
import { upload } from "../middlewares/multer.middlewares.js";
import { imageUpload } from "../controllers/Utils/imageUpload.controller.js";

const router = Router();

router.route("/upload").post(
      upload.fields([
            {
                  name: "blogImage", // The key expected in the form data
                  maxCount: 1, // Limits the number of files to 1
            },
      ]),
      imageUpload // Controller handling the logic for project upload
);

export default router;

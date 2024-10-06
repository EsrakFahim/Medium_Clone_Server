import { Router } from "express";
import { uploadBlog } from "../controllers/Blogs/UploadBlog.controller.js";
import { getBlogs } from "../controllers/Blogs/getBlogs.controller.js";
import { singleBlog } from "../controllers/Blogs/singleBlog.controller.js";

const router = Router();

router.route("/").get(getBlogs);
router.route("/:_id").get(singleBlog);
router.route("/upload").post(
      upload.fields([
            {
                  name: "blogCoverImage", // The key expected in the form data
                  maxCount: 1, // Limits the number of files to 1
            },
      ]),
      uploadBlog
);

export default router;

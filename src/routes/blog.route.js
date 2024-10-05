import { Router } from "express";
import { uploadBlog } from "../controllers/Blogs/UploadBlog.controller.js";

const router = Router();

router.route("/upload").post(uploadBlog);


export default router;
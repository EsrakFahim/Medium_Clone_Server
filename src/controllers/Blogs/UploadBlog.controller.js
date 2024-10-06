import { uploadFileCloudinary } from "../../FileHandler/Upload.js";
import { Blog } from "../../models/blog.model.js";
import { apiErrorHandler } from "../../utils/apiErrorHandler.js";
import { apiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const uploadBlog = asyncHandler(async (req, res) => {
      const { title, subtitle, content, tags } = req.body;

      // Validate input fields
      if (!title) {
            throw new apiErrorHandler(400, "Blog title is required");
      }
      if (!subtitle) {
            throw new apiErrorHandler(400, "Blog subtitle is required");
      }
      if (!content) {
            throw new apiErrorHandler(400, "Blog content is required");
      }
      if (!Array.isArray(tags) || tags.length === 0) {
            throw new apiErrorHandler(400, "At least one tag is required");
      }

      // Check for duplicate blog title
      const existingBlog = await Blog.findOne({ title });
      if (existingBlog) {
            throw new apiErrorHandler(
                  409,
                  "A blog with this title already exists"
            );
      }

      console.log(req.files);

      try {
            // Check if project image is uploaded
            const projectImagePath = req.files.blogCoverImage[0].path;

            if (!projectImagePath)
                  throw new apiErrorHandler(
                        400,
                        "Validation Error",
                        "Project cover image is required"
                  );

            const projectCoverImageUpload =
                  await uploadFileCloudinary(projectImagePath);

            if (!projectCoverImageUpload)
                  throw new apiErrorHandler(
                        500,
                        "Internal Server Error",
                        "Error uploading project cover image"
                  );

            console.log(projectCoverImageUpload);

            // Create and save the blog post
            const blog = await Blog.create({
                  title,
                  subtitle,
                  content,
                  tags: tags || [],
                  blogCoverImage: projectCoverImageUpload?.secure_url,
            });

            console.log("Blog", blog);

            if (!blog) {
                  return apiErrorHandler(500, "Failed to upload blog");
            }

            // Return success response
            return res
                  .status(201)
                  .json(
                        new apiResponse(201, blog, "Blog uploaded successfully")
                  );
      } catch (error) {
            // Handle server-side errors
            throw new apiErrorHandler(
                  500,
                  // "Internal server error",
                  error.message
            );
      }
});

export { uploadBlog };

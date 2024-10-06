import { Blog } from "../../models/blog.model.js";
import { apiErrorHandler } from "../../utils/apiErrorHandler.js";
import { apiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const singleBlog = asyncHandler(async (req, res) => {
      const { _id } = req.params;

      try {
            if (!_id) {
                  throw new apiErrorHandler(400, "Blog ID is required");
            }

            // Fetch single blog
            const blog = await Blog.findById(_id);

            if (!blog) {
                  throw new apiErrorHandler(404, "Blog not found");
            }

            // Return success response
            return res
                  .status(200)
                  .json(
                        new apiResponse(200, blog, "Blog fetched successfully")
                  );
      } catch (error) {
            throw new apiErrorHandler(500, error, "Internal server error");
      }
});

export { singleBlog };

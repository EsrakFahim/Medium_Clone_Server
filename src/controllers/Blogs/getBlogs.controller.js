import { Blog } from "../../models/blog.model.js";
import { apiErrorHandler } from "../../utils/apiErrorHandler.js";
import { apiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const getBlogs = asyncHandler(async (req, res) => {
      try {
            // Fetch all blogs
            const blogs = await Blog.find();

            // Return success response
            return res
                  .status(200)
                  .json(
                        new apiResponse(
                              200,
                              blogs,
                              "Blogs fetched successfully"
                        )
                  );
      } catch (error) {
            throw new apiErrorHandler(500, error, "Internal server error");
      }
});

export { getBlogs };

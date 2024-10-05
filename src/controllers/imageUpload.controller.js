import { apiErrorHandler } from "../utils/apiErrorHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadFileCloudinary } from "../FileHandler/Upload.js";

const imageUpload = asyncHandler(async (req, res) => {
      console.log(req.files);
      // Check if project image is uploaded
      const projectImagePath = req.files.blogImage[0].path;

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

      return res
            .status(200)
            .json(
                  new apiResponse(
                        200,
                        projectCoverImageUpload,
                        "Project cover image uploaded successfully"
                  )
            );
});

export { imageUpload };

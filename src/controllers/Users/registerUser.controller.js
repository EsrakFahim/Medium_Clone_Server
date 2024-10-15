import { uploadFileCloudinary } from "../../FileHandler/Upload.js";
import { User } from "../../models/user.model.js";
import { sendVerificationEmail } from "../../Options/mailOptions.js";
import { apiErrorHandler } from "../../utils/apiErrorHandler.js";
import { apiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import bcrypt from "bcryptjs"; // For password hashing
import crypto from "crypto"; // For generating verification tokens

const registerUser = asyncHandler(async (req, res, next) => {
      console.log(req.body);
      console.log(req.files);

      const {
            userName,
            fullName,
            email,
            password,
            phone,
            dateOfBirth,
            bio,
            location,
      } = req.body;

      // Validate required fields
      if (
            [userName, fullName, email, password].some(
                  (field) => !field?.trim()
            )
      ) {
            throw new apiErrorHandler(
                  400,
                  "All required fields must be provided"
            );
      }

      // Check if the user already exists
      const existingUser = await User.findOne({
            $or: [{ email }, { phone }, { userName }],
      });

      if (existingUser) {
            if (existingUser.email === email) {
                  throw new apiErrorHandler(400, "Email already exists");
            }
            if (existingUser.phone === phone) {
                  throw new apiErrorHandler(400, "Phone number already exists");
            }
            if (existingUser.userName === userName) {
                  throw new apiErrorHandler(400, "Username already exists");
            }
      }

      // Handle avatar upload
      const profilePicturePath = req.files?.profilePicture?.[0]?.path;
      if (!profilePicturePath) {
            throw new apiErrorHandler(400, "Avatar is required");
      }

      const uploadProfilePicture =
            await uploadFileCloudinary(profilePicturePath);
      if (!uploadProfilePicture) {
            throw new apiErrorHandler(500, "Error uploading avatar");
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Generate email verification token
      const emailVerificationToken = crypto.randomBytes(32).toString("hex");

      // Create the user in the database
      const user = await User.create({
            userName,
            fullName,
            email,
            password: hashedPassword,
            phone,
            dateOfBirth,
            bio,
            location,
            avatar: uploadProfilePicture,
            avatarAlt: uploadProfilePicture.original_filename || "Avatar",
            emailVerificationToken,
      });

      if (!user) {
            throw new apiErrorHandler(500, "Error registering user");
      }

      // Send verification email
      const verifyMailSend = await sendVerificationEmail(
            user.email,
            emailVerificationToken
      );

      if (!verifyMailSend) {
            throw new apiErrorHandler(500, "Error sending verification email");
      }

      const newUser = await User.findById(user._id).select(
            "-password -emailVerificationToken -resetPasswordToken -resetPasswordExpires"
      );

      return res
            .status(201)
            .json(
                  new apiResponse(201, "User registered successfully", newUser)
            );
});

export { registerUser };

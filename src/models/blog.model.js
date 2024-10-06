import mongoose, { Schema } from "mongoose";
import slugify from "slugify";

const blogSchema = new Schema(
      {
            title: {
                  type: String,
                  required: [true, "Title is required"],
                  unique: true, // Prevents duplicate titles
                  minlength: [10, "Title must be at least 10 characters"],
                  maxlength: [100, "Title must be less than 100 characters"],
            },
            subtitle: {
                  type: String,
                  required: [true, "Subtitle is required"],
                  minlength: [10, "Subtitle must be at least 10 characters"],
                  maxlength: [150, "Subtitle must be less than 150 characters"],
            },
            content: {
                  type: String,
                  required: [true, "Content is required"],
                  minlength: [50, "Content must be at least 50 characters"],
            },
            tags: {
                  type: [String],
                  required: [true, "At least one tag is required"],
                  validate: [arrayLimit, "{PATH} exceeds the limit of 10"], // Custom validation for max tags
            },
            blogCoverImage: {
                  type: String,
                  required: [true, "Blog cover image is required"],
            },
            slug: {
                  type: String,
                  unique: true, // Ensure uniqueness for SEO purposes
            },
      },
      { timestamps: true }
);

// Custom validator for tag limits
function arrayLimit(val) {
      return val.length <= 10; // Max 10 tags allowed
}

// Pre-save hook to auto-generate slug from title
blogSchema.pre("save", function (next) {
      if (this.title) {
            this.slug = slugify(this.title, { lower: true, strict: true });
      }
      next();
});

export const Blog = mongoose.model("Blog", blogSchema);

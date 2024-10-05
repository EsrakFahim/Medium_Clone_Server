import multer from "multer";

const storage = multer.diskStorage({
      destination: function (req, file, cb) {
            cb(null, "./public/temp");
            console.log("File uploaded", cb);
      },
      filename: function (req, file, cb) {
            const uniqueSuffix =
                  Date.now() + "-" + Math.round(Math.random() * 1e9);
            cb(null, file.originalname + "-" + uniqueSuffix);
            console.log("File uploaded 2", cb);
      },
});

export const upload = multer({ storage });

import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

export const upload = multer({
  storage,
});

// import multer from "multer";

// const STORAGE = multer.diskStorage({
//     destination:function(req,file,cb){
//         const destPath = "./public/temp"
//         cb(null,destPath)
//     },
//     filename : function(req,file,cb){
//         cb(null,file.originalname);
//     }
// })

// export const upload = multer({
//     storage:STORAGE
// })

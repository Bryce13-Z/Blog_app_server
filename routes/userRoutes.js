const express = require("express")
const multer = require("multer")
const router = express.Router() 

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'upload/users/')
//     },
//     filename: function (req, file, cb) {
//         cb(null, file.originalname)
//     } 
// })

const storage = multer.memoryStorage()

const upload = multer({ 
    storage: storage, 
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype !== "image/jpeg" && file.mimetype !== 'image/png' && file.mimetype !== 'image/jpg') {
            return cb(new Error("Only JPEG, PEG and JPG files are allowed"))
        }
        cb(null, true)
    }
})
const {registerUser, SignInUser, CurrentUser, UpdateInfo} = require("../controllers/userController.js")
const validateToken = require("../middlewares/validateTokenHandler.js")


router.post("/register", registerUser)
router.post("/login", SignInUser)
router.patch("/update", validateToken, upload.single('userIcon'), UpdateInfo)
router.get("/current", validateToken, CurrentUser)


module.exports = router

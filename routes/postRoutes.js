const express = require("express")
const multer = require("multer")
const router = express.Router() 
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

const validateToken = require("../middlewares/validateTokenHandler.js")
const {getPosts, getPost, createPost, updatePost, deletePost, likePost, getPostsByUserId, getPostByEditReq, getPostsByLiked} = require("../controllers/postController.js")

// get all posts
router.get("/", getPosts)
// get post by id
router.get("/:id", getPost)
// get post by userId 
router.get("/getPostsByUserId/:page", validateToken, getPostsByUserId)
// get post by liked 
router.get("/getPostsByLiked/:page", validateToken, getPostsByLiked)
// get post due to editing req by creator 
router.get("/getPostByEditing/:id", validateToken, getPostByEditReq)

// create a post 
router.post("/", validateToken, upload.single('cover'),createPost)
// update a post 
router.patch("/:id", validateToken, upload.single('cover'), updatePost)
// delete a post 
router.delete("/:id", validateToken, deletePost)
// update the like num 
router.patch("/:id/likePost", validateToken, likePost)
// // update the comments
// router.patch("/:id/commentPost", validateToken, commentPost)

module.exports = router
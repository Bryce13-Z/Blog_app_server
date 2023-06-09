const express = require("express")
const router = express.Router()

const validateToken = require("../middlewares/validateTokenHandler.js")
const {getCommentsByPostId, createComment} = require("../controllers/commentController.js")


//get all comments by postId 
router.get("/:id/getComments", getCommentsByPostId)

//create a new comments 
router.post("/:id/createComment", validateToken, createComment)


module.exports = router
const asyncHandler = require("express-async-handler")
const mongoose = require("mongoose")
const PostComment = require("../models/postCommentModel.js")
const Post = require("../models/postModel.js")
const User = require("../models/userModel.js")


const getCommentsByPostId = asyncHandler(async (req, res) => {
    const { id } = req.params
    const { page } = req.query
    
    const LIMIT = 9 
    const startIndex = (Number(page) - 1) * LIMIT
    const total = await PostComment.countDocuments({ postId: id})
    const comments = await PostComment.find({ postId: id}).sort({_id: -1}).limit(LIMIT).skip(startIndex) 

    if (total && comments) {
        res.status(200).json({data: comments, currentPage: Number(page), numberOfPage: Math.ceil(total/LIMIT)})
    } else {
        res.status(200).json({data: [], currentPage: Number(page), numberOfPage: Math.ceil(total/LIMIT)})
    }

})

const createComment = asyncHandler(async (req, res) => {
    const { id } = req.params
    const { comment } = req.body 
    const user = req.user

    if (user && mongoose.Types.ObjectId.isValid(id)) {
        const post = await Post.findById(id)
        const oldUser = await User.findById(user._id)
        const base64UserIcon = oldUser?.userIcon.toString('base64') || ""
        const newComment = new PostComment({postId: post._id, username: oldUser.username, userId: oldUser._id, userIcon: base64UserIcon, comment: comment})
        const savedComment = await newComment.save()

        post.comments.push(savedComment._id)
        const updatedPost = await Post.findByIdAndUpdate(post._id, post)

        if (savedComment && updatedPost) {
            res.status(200).json({data: savedComment})
        } else {
            res.status(500)
            throw new Error("Failed to update the likes of post!")
        }

    } else if (!user) {
        res.status(400)
        throw new Error("You are not allowed to give a comment")
    } else if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(404)
        throw new Error(`Can't find the post by id: ${id}`)
    }



})

module.exports = {getCommentsByPostId, createComment}
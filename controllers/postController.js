const asyncHandler = require("express-async-handler")
const mongoose = require("mongoose")
const Post = require("../models/postModel.js")
const User = require("../models/userModel.js")
const PostComment = require("../models/postCommentModel.js")

const getPosts = asyncHandler(async (req, res)=> {

    const { page } = req.query
    
    const LIMIT = 9
    const startIndex = (Number(page) - 1) * LIMIT
    const total = await Post.countDocuments({})
    const posts = await Post.find({}).sort({_id: -1}).limit(LIMIT).skip(startIndex).select('title cover creator creatorId tags updatedAt')

    if (total && posts) {
        res.status(200).json({ data: posts, currentPage: Number(page), numberOfPage: Math.ceil(total / LIMIT)})
    } else {
        res.status(500)
        throw new Error("Can't not found any post!")
    }
})

const getPostsByUserId = asyncHandler(async (req, res) => {
    
    const { page } = req.params
    const user = req.user

    const LIMIT = 9
    const startIndex = (Number(page) - 1) * LIMIT
    const total = await Post.countDocuments({creatorId: user._id})
    const posts = await Post.find({creatorId: user._id}).sort({_id: -1}).limit(LIMIT).skip(startIndex).select('title tags updatedAt creatorId')

    if (total && posts) {
        res.status(200).json({ data: posts, currentPage: Number(page), numberOfPage: Math.ceil(total / LIMIT)})
    } else {
        res.status(500)
        throw new Error("Can't not found any post!")
    }
})

const getPostsByLiked = asyncHandler(async (req, res) => {
    const { page } = req.params 
    const user = req.user 

    const LIMIT = 9 
    const startIndex = (Number(page) - 1) * LIMIT
    const oldUser = await User.findById(user._id)
    const postsIdArray = oldUser.likedPostsIds
    const total = postsIdArray.length

    const posts = await Post.find({ _id: { $in: postsIdArray}}).sort({_id: -1}).limit(LIMIT).skip(startIndex).select('title tags updated')

    if (posts && total) {
        res.status(200).json({data: posts, currentPage: Number(page), numberOfPage: Math.ceil(total/LIMIT)})
    } else {
        res.status(500)
        throw new Error("Can't not found any post!")
    }

})

const getPost = asyncHandler(async (req, res)=> {
    const { id } = req.params 
    const oldPost = await Post.findOne({_id: id})
    if (oldPost) {
        res.status(200).json({ data: oldPost})
    } else {
        res.status(404)
        throw new Error(`Can't not find the post by id: ${id}`)
    }
})

const getPostByEditReq = asyncHandler(async (req, res) => {
    const { id } = req.params 
    const user =req.user
    const oldPost = await Post.findOne({_id: id})

    if (oldPost && oldPost.creatorId === user._id) {
        res.status(200).json({ data: oldPost})
    } else if (!oldPost) {
        res.status(404)
        throw new Error(`Can't not find the post by id: ${id}`)
    } else {
        res.status(401)
        throw new Error(`You can't access to post by id: ${id}!`)
    }
})

const createPost = asyncHandler(async (req, res)=> {
    const post = req.body
    const file = req.file

    // covert cover image from buffer type to base64 string type 
    const base64Cover = file.buffer.toString('base64')

    // fetch user info 
    const user = await User.findOne({ _id: req.user._id})
    const base64UserIcon = user?.userIcon.toString('base64') || ""

    const newPost = new Post({title: post.title, content: post.content, cover: base64Cover, tags: post.tags, creator: user.username, creatorId: user._id, creatorIcon: base64UserIcon})
    const savedPost = await newPost.save()

    if (savedPost) {
        res.status(200).json({ data: savedPost})
    } else {
        res.status(400)
        throw new Error("Create a new post failed!")
    }

})

const updatePost = asyncHandler(async (req, res)=> {
    const { id } = req.params
    const post = req.body
    const file = req.file
    const user = req.user

    if(!mongoose.Types.ObjectId.isValid(id)) {
        res.status(404)
        throw new Error(`The post id: ${id} is invalid`)
    }
    else if (post.creatorId !== user._id) {
        res.status(401)
        throw new Error("You can't modify to this post!")
    }
    else {
        // covert cover image from buffer type to base64 string type 
        const base64Cover = file.buffer.toString('base64')

        const updatePost = await Post.findByIdAndUpdate(id, {title: post.title, content: post.content, cover: base64Cover, tags: post.tags}, { new: true})
        if (updatePost) {
            res.status(200).json({ data: updatePost})
        } else {
            res.status(500)
            throw new Error(`No post with id: ${id}`)
        }
    } 
})

const deletePost = asyncHandler(async (req, res)=> {
    const { id } = req.params
    const user = req.user


    if(!mongoose.Types.ObjectId.isValid(id)) {
        res.status(404)
        throw new Error(`The post id: ${id} is invalid`)
    }

    const oldPost = await Post.findById(id)

    if (oldPost) {
        if (oldPost.creatorId !== user._id) {
            res.status(401)
            throw new Error("You can't delete to this post!")
        }
        else {
            const removePost = await Post.findByIdAndRemove(id)
            if (removePost) {
                res.status(200).json({ message: "Post deleted successfully."})
            } else {
                res.status(404)
                throw new Error(`No post with id: ${id}`)
            }
        }
    } else {
        res.status(404)
        throw new Error("Can't find this post!")
    }
     
})

const likePost = asyncHandler(async (req, res)=> {
    const { id } = req.params
    const user = req.user
    if (user && (mongoose.Types.ObjectId.isValid(id))) {
        const post = await Post.findById(id)
        const oldUser = await User.findById(user._id)

        const index = post.likes.findIndex((id) => id === String(user._id))

        if (index === -1) {
            post.likes.push(user._id)
            oldUser.likedPostsIds.push(post._id)
        } else {
            post.likes = post.likes.filter((id) => id !== String(user._id))
            oldUser.likedPostsIds = oldUser.likedPostsIds.filter((id) => id !== String(post._id))
        }

        const updatedPost = await Post.findByIdAndUpdate(id, post, { new: true})
        const updatedUser = await User.findByIdAndUpdate(user._id, oldUser, { new: true})
        if (updatedPost && updatedUser) {
            res.status(200).json({data: updatedPost})
        } else {
            res.status(500)
            throw new Error("Failed to update the likes of post!")
        }
    } else if (!user) {
        res.status(400)
        throw new Error("You are not allowed to give a like")
    } else if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(404)
        throw new Error(`Can't find the post by id: ${id}`)
    }

})

// const commentPost = asyncHandler(async (req, res)=> {
//     const { id } = req.params
//     const { comment } = req.body 
//     const user = req.user
    
//     if (user && (mongoose.Types.ObjectId.isValid(id))) {
//         const post = await Post.findById(id)

//         const index = post.comments.findIndex((userId) => userId === String(user._id))
//         if (index === -1) {
//             // create a new comment
//             const oldUser = await User.findById(user._id)
//             const base64UserIcon = oldUser?.userIcon.toString('base64') || ""

//             const newComment = new PostComment({postId: post._id, username: oldUser.username, userId: oldUser._id, userIcon: base64UserIcon, comment: comment})
//             const savedComment = await newComment.save()

//             post.comments.push(oldUser._id)
//             const updatedPost = await Post.findByIdAndUpdate(post._id, post, { new: true})

//             if (updatedPost && savedComment) {
//                 res.status(200).json({data: updatedPost})
//             } else {
//                 res.status(500)
//                 throw new Error("Failed to update the likes of post!")
//             }

//         } else {
//             // update a new comment 
//             post.comments[index] = newComment

//         }

//     } else if (!user) {
//         res.status(400)
//         throw new Error("You are not allowed to give a comment")
//     } else if (!mongoose.Types.ObjectId.isValid(id)) {
//         res.status(404)
//         throw new Error(`Can't find the post by id: ${id}`)
//     }

//     res.json({"result": "update post comment"})
// })

module.exports = {getPosts, getPost, createPost, updatePost, deletePost, likePost, getPostsByUserId, getPostByEditReq, getPostsByLiked}
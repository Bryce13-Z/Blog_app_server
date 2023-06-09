const mongoose = require("mongoose")

const postCommentSchema = mongoose.Schema({
    postId: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true 
    },
    userIcon: {
        type: String,
    },
    comment: {
        type: String,
        required: true
    }
}, {
    timestamps: true,
})

module.exports = mongoose.model("PostComment", postCommentSchema)
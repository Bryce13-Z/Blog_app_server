const mongoose = require("mongoose")

const postSchema = mongoose.Schema(
    {
        title: {
            type: String, 
            required: [true, "Please add the title"],
        },
        content: {
            type: String, 
            required: [true, "Please add the content"],
        },
        cover: {
            type: String,
            default: "",
        },
        creator: {
            type: String,
        },
        creatorId: {
            type: String,
        },
        creatorIcon: {
            type: String,
            defualt: "",
        },
        tags: {
            type: [String],
            default: []
        },
        likes: {
            type: [String],
            default: [],
        },
        comments: {
            type: [String],
            default: [],
        }
    },
    {
        timestamps: true,
    }
) 

module.exports = mongoose.model("Post", postSchema) 
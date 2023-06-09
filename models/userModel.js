const mongoose = require("mongoose")

const userSchema = mongoose.Schema(
    {
        username: {
            type: String, 
            required: [true, "Please add the user name"],
        },
        email: {
            type: String, 
            required: [true, "Please add the user email address"],
            unique: [true, "The email address has been registered before"]
        },
        password: {
            type: String,
            requried: [true, "Please add the password"]
        },
        userIcon: {
            type: Buffer,
        },
        likedPostsIds: {
            type: [String],
            default: []
        }
    }, 
    {
        timestamps: true,
    }
)

module.exports =  mongoose.model("User", userSchema) 
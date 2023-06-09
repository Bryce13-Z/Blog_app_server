const asyncHandler = require("express-async-handler")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const User = require("../models/userModel.js")

const registerUser = asyncHandler(async (req, res) => {

    const {username, email, password } = req.body
    if (!username || !email || !password) {
        res.status(400)
        throw new Error("All fields are mandatory!")
    }

    const userExist = await User.findOne({ email })
    if (userExist) {
        res.status(400)
        throw new Error("User already registed!")
    }

    // Hash the password 
    const hashedPassword = await bcrypt.hash(password, 12)
    console.log("Hashed Password:", hashedPassword)

    // store user info into db 
    const newUser = await User.create({
        username,
        email, 
        password: hashedPassword
    })
    console.log(`New User created: ${newUser}`)

    if(newUser) {
        // generate jwt token 
        const token = jwt.sign(
        {
            user: {
                username: newUser.username,
                email: newUser.email,
                _id: newUser._id
            }
        },
        process.env.JWT_TOKEN_SECRET,
        { expiresIn: "24h"}
        ) 
        // send user information and token to client 
        res.status(201).json({ result: {
            username: newUser.username,
            email: newUser.email,
            _id: newUser._id
        }, token})
    } else {
        res.status(400)
        throw new Error("User data don't valid!")
    }

})

const SignInUser = asyncHandler(async (req, res) => {

    const { email, password } = req.body
    if (!email || !password) {
        res.status(400)
        throw new Error("All fields are mandatory!")
    } 

    const oldUser = await User.findOne({ email })
    
    if (oldUser && (await bcrypt.compare(password, oldUser.password))) {
        // generate jwt token 
        const token = jwt.sign(
            {
                user: {
                    username: oldUser.username,
                    email: oldUser.email,
                    _id: oldUser._id
                }
            },
            process.env.JWT_TOKEN_SECRET,
            { expiresIn: "24h"}
        )

        // convert image file from binary to base64 string 
        const base64userIcon = oldUser?.userIcon.toString('base64')
        
        res.status(200).json({ result: {
            username: oldUser.username,
            email: oldUser.email,
            _id: oldUser._id,
            userIcon: base64userIcon
        }, token})
    } else {
        res.status(401)
        throw new Error("email or password is not valid")
    }
})

const UpdateInfo = asyncHandler(async (req, res) => {
    const { username } = req.body
    const user = req.user
    const file = req.file
    const updatedUser = await User.findByIdAndUpdate(user._id, {username, userIcon: file.buffer}, {new: true})
    if (updatedUser) {

        // convert userIcon from buffer to base64
        const base64userIcon = updatedUser.userIcon.toString('base64')

        res.status(200).json({ result: {
            username: updatedUser.username,
            email: updatedUser.email,
            _id: updatedUser._id,
            userIcon: base64userIcon
        }})
    } else {
        res.status(500)
        throw new Error("Failed to update the user info!")
    }
}) 

const CurrentUser = asyncHandler(async (req, res) => {
    const user = req.user 
    const authData = await User.findOne({ _id: user._id})
    if (authData) {
        // convert userIcon from buffer to base64
        const base64userIcon = authData.userIcon.toString('base64')

        res.status(200).json({ result: {
            username: authData.username,
            email: authData.email,
            _id: authData._id,
            userIcon: base64userIcon
        }})
    } else {
        res.status(404)
        throw new Error("Can't not find the user!")
    }
})

module.exports = {registerUser, SignInUser, CurrentUser, UpdateInfo}
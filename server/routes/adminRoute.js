const express = require('express');
const router = express.Router();
const post = require('../models/PostModel');
const bcrypt = require('bcrypt');
const jwt =  require('jsonwebtoken');
const userModel = require('../models/UserModel');
const PostModel = require('../models/PostModel');



const adminLayout = '../views/layout/adminLayout'


// Check Login  
const authMiddleWare = (req,res,next) =>{
    const token = req.cookies.token;
    if(!token){
        return res.status(401).json({ message: 'UnAuthorized' })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId=decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ message: 'UnAuthorised'})
    }
}

// GET Admin - Login

router.get('/admin', async(req,res)=>{
    try {
        const locals = {
            title: "Admin",
            description: "Simple blog created with Node js"
        }
        res.render('admin/index',{locals, layout: adminLayout})
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
})


// POST Admin - check Login 

router.post('/admin',async(req,res)=>{
    try {
        const { username, password} = req.body;
        const user = await userModel.findOne({username});
        if(!user){
            return res.status(401).json({message: "Invalid Credentials"});
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            return res.status(401).json({ message: "Invalid Credentials"});
        }

        const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET);
        res.cookie('token',token, {httpOnly: true});

        res.redirect('/dashboard');

    } catch (error) {
        console.log(error)
    }
})

// POST - Admin - register
router.post('/register',async(req,res)=>{
    try {
        const {username, password} = req.body;
        const hashedPassed = await bcrypt.hash(password, 10);

        try {
            const user = await userModel.create({ username, password: hashedPassed });
            res.status(201).json({message: "User created", user})
        } catch (error) {
            
        }

    } catch (error) {
        if(error.code === 11000){
            res.status(409).json({message: "User already in use"});
        }
        res.status(500).json({message:"Internal Server Error"})
        console.error(error);
        
    }
})

// GET / Admin dashboard 
router.get('/dashboard', authMiddleWare, async(req,res)=>{
    try {
        const locals={
            title:'Dashboard',
            description: 'Simple Blog created with Node Js, Express & MongoDb.'
        }
        const data = await PostModel.find();
        res.render('admin/dashboard', { locals, data, layout:adminLayout});
        
    } catch (error) {
        console.error(error);
    }
})

//GET / Admin New post 

router.get('/add-post',authMiddleWare, async( req, res )=>{
    try {
        const locals = {
            title: 'Add Post',
            description: 'Simple Blog created with NodeJs, Express & MongoDb.'
        }
        const data = await PostModel.find();
        res.render('admin/add-post',{locals, layout: adminLayout});
    } catch (error) {
        console.error();
        
    }
})

//POST / Submit New Post

router.post('/add-post', authMiddleWare, async(req,res) => {
    try {
        // console.log(req.body);
        try {
            const newPost = new PostModel({
                title : req.body.title,
                body :req.body.body
            })
            await PostModel.create(newPost)
            res.redirect('/dashboard');
        } catch (error) {
            console.error(error);
            
        }
        // const data = await PostModel.find()
        // res.render('admin/add-post', { layout: adminLayout})
    } catch (error) {
        console.error();
        
    }
} )

//GET / Admin New post 

router.get('/edit-post/:id',authMiddleWare, async( req, res )=>{
    try {

        const locals = {
            title: 'Add Post',
            description: 'Simple Blog created with NodeJs, Express & MongoDb.'
        }
        const data = await PostModel.findOne({_id: req.params.id});
        res.render('admin/edit-post',{locals, data, layout: adminLayout});
    } catch (error) {
        console.error();
        
    }
})


//PUT / Admin New post 

router.put('/edit-post/:id',authMiddleWare, async( req, res )=>{
    try {

        await PostModel.findByIdAndUpdate(req.params.id,{title: req.body.title, body: req.body.body, updatedAt: Date.now()});
        res.redirect(`/edit-post/${req.params.id}`);
    } catch (error) {
        console.error();
        
    }
})

// DELETE / Admin - DELETE POST 
router.delete('/delete-post/:id', authMiddleWare, async(req,res)=>{
    try {
        await PostModel.deleteOne({_id: req.params.id});
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        
    }
})

//GET / Admin - LOGOUT

router.get('/logout',(req,res)=>{
    res.clearCookie('token');
    // res.json({message: "Logout Successful"});
    res.redirect('/');
})

module.exports=router;
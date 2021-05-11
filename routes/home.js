const router = require("express").Router();
const { isAuth } = require("../services/authMiddleware");
const { isDoubleAuth } = require("../services/authMiddleware");
const Posts = require("../controllers/PostsController");
const Followings = require("../controllers/FollowingsController");
const Users = require("../controllers/UsersController");
const createRoomId = require("../services/createRoomId");

router.get("/",(req,res)=>{
    res.render("404.hbs")
});

// router.get("/", isAuth,async (req, res) => {
//     try {
//         let {page}= req.query;
//         page = parseInt(page);
//         size = 3;
//         if(!page){
//             page = 1;
//         }
//         let from = (page-1)*size;
//         let to = page*size;
//         const homePagePosts = await Posts.getHomePagePosts(req.user.id);
//         homePagePosts[0].forEach(post =>{
//             if(post.num_of_comments === null){
//                 post.num_of_comments = 0;
//             }
//             if(post.num_of_likes === null){
//                 post.num_of_likes = 0;
//             }
//         });
//         const followers = await Followings.getUsersFollowers(req.user.id);
//         const pagePosts = homePagePosts[0].slice(from,to);
//         const numOfPosts = homePagePosts[0].length;
//         res.render("home.hbs", {
//             loggedUser: req.user,
//             posts: pagePosts,
//             followers,
//             numOfPosts,
//             page
//         }); 
//     } catch (error) {
//         res.status(403).json(error);
//     }
// });

router.get("/register", isDoubleAuth, async (req, res) => {
    try {
        res.render("register.hbs");
    } catch (error) {
        res.status(403).json(error);
    }
});

router.get("/login", isDoubleAuth, async (req, res) => {
    try {
        res.render("login.hbs");
    } catch (error) {
        res.status(403).json(error);
    }
});

router.get("/public-chat",isAuth,async(req,res)=>{
    try {
        const users = await Users.getAllUsers();
        res.render("public-chat.hbs", {
            loggedUser: req.user,
            users:users[0]
        });
    } catch (error) {
        res.json(error);
    }
});

router.get("/private-chat/:userId",isAuth,async(req,res)=>{
    try {
        const users = await Users.getAllUsers();
        const chatWithUser = await Users.getUserById(req.params.userId);
        const roomId = await createRoomId(req.user.id,req.params.userId);
        res.render("private-chat.hbs", {
            loggedUser: req.user,
            users:users[0],
            chatWithUser,
            roomId
        });
    } catch (error) {
        res.json(error);
    }
});


module.exports = router;
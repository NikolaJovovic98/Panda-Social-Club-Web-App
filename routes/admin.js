const router = require("express").Router();
const Posts = require("../controllers/PostsController");
const Users = require("../controllers/UsersController");
const Followings = require("../controllers/FollowingsController");
const { isAuth } = require("../services/authMiddleware");
const { isAdmin } = require("../services/authMiddleware");
const imageDeleter = require("../services/imageDeleter");

router.get("/pending-posts", isAuth, isAdmin, async (req, res) => {
    try {
        const allPendingPosts = await Posts.getAdminPendingPosts();
        const followers = await Followings.getUsersFollowers(req.user.id);
        res.render("admin-pending-posts.hbs",{
            loggedUser:req.user,
            posts:allPendingPosts,
            followers
        });
    } catch (error) {
        res.json(error);
    }
});

router.post("/approve-post/:postId",isAuth,isAdmin, async (req, res) => {
    try {
        await Posts.adminApprovePost(req.user.id,req.params.postId);
        req.flash("success_messages", "Post approved");
        res.redirect(`/admin/pending-posts/`);
    } catch (error) {
        res.json(error);
    }
});

router.post("/reject-post/:postId",isAuth,isAdmin, async (req, res) => {
    try {
        await Posts.adminRejectPost(req.user.id,req.params.postId);
        req.flash("orange_message","Post was rejected and deleted");
        res.redirect("/admin/pending-posts");
    } catch (error) {
        res.json(error);
    }
});

router.post("/make-admin/:userId",isAuth,isAdmin, async (req, res) => {
    try {
        await Users.makeAdmin(req.params.userId);
        req.flash("success_messages","User set to admin");
        res.redirect("/users/all-users");
    } catch (error) {
        res.json(error);
    }
});

router.post("/remove-admin/:userId",isAuth,isAdmin, async (req, res) => {
    try {
        await Users.removeAdmin(req.params.userId);
        req.flash("orange_message","User removed from admin team");
        res.redirect("/users/all-users");
    } catch (error) {
        res.json(error);
    }
});

router.post("/remove-user/:userId",isAuth,isAdmin, async (req, res) => {
    try {
        console.log("Remove user attempt at :"+ new Date);
        await Users.removeUser(req.params.userId);
        req.flash("orange_message","User removed");
        res.redirect("/users/all-users");
    } catch (error) {
        res.json(error);
    }
});

router.get("/review-posts",isAuth,isAdmin,async(req,res)=>{
    try {
        const posts = await Posts.getAllPosts();
        const followers = await Followings.getUsersFollowers(req.user.id);
        res.render("admin-review-posts.hbs",{
            loggedUser:req.user,
            posts,
            followers
        });
    } catch (error) {
        res.json(error);
    }
});

router.post("/delete-post/:postId",isAuth,isAdmin,async(req,res)=>{
    const postId=req.params.postId;
    const adminId = req.user.id;
    try {
        await Posts.adminDeletePost(postId,adminId);
        req.flash("orange_message","Post deleted");
        res.redirect("/admin/review-posts");
    } catch (error) {
        res.json(error);
    } 
});

module.exports = router;


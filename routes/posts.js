const router = require("express").Router();
const { isAuth } = require("../services/authMiddleware");
const Posts = require("../controllers/PostsController");
const Comments = require("../controllers/CommentsController");
const Followings = require("../controllers/FollowingsController");
const Likes = require("../controllers/LikesController");

router.post("/add", isAuth, async (req, res) => {
    try {
        await Posts.addNewPost(req.body.postBody, req.user.id);
        req.flash("success_messages", "Your post is waiting to be reviewed by admin team in order to be published. Thank you!");
        res.redirect('/');
    } catch (error) {
        res.status(403).json(error);
    }
});

router.get("/show/:postId", isAuth, async (req, res) => {
    const postId = req.params.postId;
    const userId = req.user.id;
    try {
        const post = await Posts.getPostById(postId);
        const comments = await Posts.getCommentsByPost(postId);
        const followers = await Followings.getUsersFollowers(userId);
        const postLiked = await Likes.checkLike(userId, postId);
        const numOfLikes = await Likes.countNumberOfLikes(postId);
        const usersWhoLikedPost = await Posts.getUsersWhoLiked(postId);
        res.render("show-post.hbs", {
            loggedUser: req.user,
            post,
            comments,
            followers,
            postLiked,
            numOfLikes,
            usersWhoLikedPost
        });
    } catch (error) {
        if (error.message === "Post is not approved yet...") {
            req.flash("error_messages", error.message);
            res.redirect("/posts/pending-posts");
        }
    }
});

router.post("/add/comment/:postId", isAuth, async (req, res) => {
    try {
        await Comments.addComment(req.body.comment, req.params.postId, req.user.id);
        req.flash("success_messages", "Comment posted");
        res.redirect(`/posts/show/${req.params.postId}`);
    } catch (error) {
        res.status(403).json(error);
    }
});

router.post("/delete/:postId", isAuth, async (req, res) => {
    try {
        await Posts.deletePost(req.params.postId, req.user.id);
        req.flash("success_messages", "Post Deleted");
        res.redirect(`/users/profile/${req.user.id}`);
    } catch (error) {
        res.status(403).json(error);
    }
});

router.get("/edit/:postId", isAuth, async (req, res) => {
    try {
        const followers = await Followings.getUsersFollowers(req.user.id);
        const post = await Posts.getPendingPostToEdit(req.params.postId);
        res.render("edit-post.hbs", {
            loggedUser: req.user,
            post,
            followers: followers
        });
    } catch (error) {
        res.status(403).json(error);
    }
});

router.post("/edit/:postId", isAuth, async (req, res) => {
    const postId = req.params.postId;
    const userId = req.user.id;
    const updateBody = req.body.updateBody;
    try {
        await Posts.editPost(postId, userId, updateBody);
        req.flash("success_messages", "Post text updated");
        res.redirect("/posts/pending-posts");
    } catch (error) {
        res.json(error);
    }
});

router.post("/delete/comment/:commentId", isAuth, async (req, res) => {
    try {
        await Comments.deleteComment(req.params.commentId, req.user.id, parseInt(req.query.postId));
        req.flash("success_messages", "Comment Deleted");
        res.redirect(`/posts/show/${req.query.postId}`);
    } catch (error) {
        res.status(403).json(error);
    }
});

router.post("/like/:postId", isAuth, async (req, res) => {
     const postId = req.params.postId;
     const userId = req.user.id;
    try {
        await Likes.like(userId, postId);
        req.flash("success_messages", "Post Liked");
        res.redirect(`/posts/show/${postId}`);
    } catch (error) {
        res.json(error);
    }
});

router.post("/unlike/:postId", isAuth, async (req, res) => {
    const postId = req.params.postId;
    const userId = req.user.id;
    try {
        await Likes.unlike(userId, postId);
        req.flash("success_messages", "Like Removed");
        res.redirect(`/posts/show/${postId}`);
    } catch (error) {
        res.json(error);
    }
});

router.get("/popular-posts", async (req, res) => {
    const userId = req.user.id;
    try {
        const followers = await Followings.getUsersFollowers(userId);
        const popularPosts = await Posts.getPopularPosts();
        res.render("popular-posts.hbs", {
            loggedUser: req.user,
            popularPosts,
            followers
        });
    } catch (error) {
        res.json(error);
    }
});

router.get("/pending-posts", isAuth, async (req, res) => {
    const loggedUserId = req.user.id;
    try {
        const pendingPosts = await Posts.getPendingPosts(loggedUserId);
        const followers = await Followings.getUsersFollowers(loggedUserId);
        res.render("user-pending-posts.hbs", {
            loggedUser: req.user,
            posts: pendingPosts,
            followers
        })
    } catch (error) {
        res.json(error);
    }
});

router.get("/liked-posts",isAuth,async(req,res)=>{
    try {
        const likedPosts = await Posts.getLikedPosts(req.user.id);
        const followers = await Followings.getUsersFollowers(req.user.id);
        res.render("liked-user-posts.hbs",{
            loggedUser: req.user,
            likedPosts:likedPosts[0],
            followers
        });
    } catch (error) {
        console.log(error);
        res.json(error);
    }
});


module.exports = router;
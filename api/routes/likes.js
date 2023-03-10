const router = require('express').Router();
const Post = require('../models/Post');
const verify = require('../utils/verifyToken');
var {responseCode, setAndSendResponse} = require('../response/error');

router.post('/like', verify, async (req, res) => {
    var {id} = req.query;
    var user = req.user;
    // PARAMETER_IS_NOT_ENOUGH
    if(id !== 0 && !id) {
        console.log("Không có param id");
        return setAndSendResponse(res, responseCode.PARAMETER_IS_NOT_ENOUGH);
    }
    // PARAMETER_TYPE_IS_INVALID
    if((id && typeof id !== "string")) {
        console.log("PARAMETER_TYPE_IS_INVALID");
        return setAndSendResponse(res, responseCode.PARAMETER_TYPE_IS_INVALID);
    }
    var post;
    try {
        post = await Post.findById(id);
    } catch (err) {
        if(err.kind == "ObjectId") {
            console.log("Sai id");
            return setAndSendResponse(res, responseCode.POST_IS_NOT_EXISTED);
        }
        return setAndSendResponse(res, responseCode.CAN_NOT_CONNECT_TO_DB);
    }

    if (!post) {
        console.log("Không tìm thấy bài viết");
        return setAndSendResponse(res, responseCode.POST_IS_NOT_EXISTED);
    }

    if(post.likedUser) {
        if(post.likedUser.includes(user.id)) {
            const index = post.likedUser.indexOf(user.id);
            post.likedUser.splice(index, 1);
        } else {
            post.likedUser.push(user.id);
        }
    } else {
        post.likedUser = [user.id];
    }
    try {
        const updatedPost = await post.save();
        res.status(200).send({
            code: "1000",
            message: "OK",
            data: {
                like: updatedPost.likedUser.length.toString()
            }
        });
    } catch (err) {
        console.log(err);
        return setAndSendResponse(res, responseCode.CAN_NOT_CONNECT_TO_DB);
    }
});

module.exports = router;
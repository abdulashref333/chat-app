const express = require('express');
const router = express.Router();
const posts = [
    {title:'post 1', content:'i need help '},
    {title:'post 2', content:'i could help you to do any thing'},
    {title:'post 3', content:'do you love me ..'}
];

router.get('/posts',(req,res) => {
    res.send(posts);
});

router.post('/posts', (req, res) =>{
    const post = {
        title:req.body.title,
        content:req.body.content
    };

    posts.unshift(post);
    res.send(posts);
})
module.exports = router;
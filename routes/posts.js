const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const Post = require('../models/Post');

// Get posts of logged in user
router.get('/', authMiddleware, async (req, res) => {
    const perPage = 3;
    const page = req.query.page || 1;
    const device = req.query.device || null;
    const minComments = req.query.minComments || null;
    const maxComments = req.query.maxComments || null;

    const query = { user: req.user.id };

    if (device) {
        query.device = device;
    }

    if (minComments && maxComments) {
        query.no_of_comments = { $gte: minComments, $lte: maxComments };
    } else if (minComments) {
        query.no_of_comments = { $gte: minComments };
    } else if (maxComments) {
        query.no_of_comments = { $lte: maxComments };
    }

    try {
        const posts = await Post.find(query)
            .skip((perPage * page) - perPage)
            .limit(perPage)
            .sort('-createdAt')
            .exec();

        const count = await Post.countDocuments(query).exec();

        return res.status(200).json({
            posts,
            currentPage: page,
            pages: Math.ceil(count / perPage),
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }
});

// Create a post
router.post('/add', authMiddleware, async (req, res) => {
    try {
        const { title, body, device } = req.body;

        const post = new Post({
            title,
            body,
            device,
            user: req.user.id,
        });

        await post.save();
        return res.status(201).json(post);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }
});

// Update a post
router.put('/update/:id', authMiddleware, async (req, res) => {
    try {
        const { title, body } = req.body;
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (post.user.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        post.title = title || post.title;
        post.body = body || post.body;
        await post.save();

        return res.status(200).json(post);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }
});

// Delete a post
router.delete('/delete/:id', authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (post.user.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        await post.remove();

        return res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }
});

// Get a single post by ID
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);


        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (post.user.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        return res.status(200).json(post);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;




const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const authMiddleware = require('./middlewares/auth');

const app = express();
let a=1;

dotenv.config();

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Routes
const usersRoutes = require('./routes/users');
const postsRoutes = require('./routes/posts');

app.use('/users', usersRoutes);
app.use('/posts', authMiddleware, postsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// Start server
app.listen(process.env.PORT || 3000, () => {
  console.log(`Server started on port ${process.env.PORT || 3000}`);
});

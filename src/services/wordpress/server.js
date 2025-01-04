const express = require('express');
const axios = require('axios');
const cors = require('cors');
const helmet = require('helmet');
const winston = require('winston');
const { MongoClient } = require('mongodb');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3005;

// Logger configuratie
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// MongoDB connectie
const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = 'wordpress_integration';
let db;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuten
  max: 100 // limiet per IP
});
app.use(limiter);

// WordPress API client class
class WordPressClient {
  constructor(siteUrl, username, password) {
    this.baseUrl = `${siteUrl}/wp-json/wp/v2`;
    this.auth = {
      username: username,
      password: password
    };
  }

  async getPosts(page = 1, perPage = 10) {
    try {
      const response = await axios.get(`${this.baseUrl}/posts`, {
        params: {
          page,
          per_page: perPage
        },
        auth: this.auth
      });
      return response.data;
    } catch (error) {
      logger.error('Error fetching posts:', error);
      throw error;
    }
  }

  async getPost(id) {
    try {
      const response = await axios.get(`${this.baseUrl}/posts/${id}`, {
        auth: this.auth
      });
      return response.data;
    } catch (error) {
      logger.error(`Error fetching post ${id}:`, error);
      throw error;
    }
  }

  async createPost(data) {
    try {
      const response = await axios.post(`${this.baseUrl}/posts`, data, {
        auth: this.auth
      });
      return response.data;
    } catch (error) {
      logger.error('Error creating post:', error);
      throw error;
    }
  }

  async updatePost(id, data) {
    try {
      const response = await axios.put(`${this.baseUrl}/posts/${id}`, data, {
        auth: this.auth
      });
      return response.data;
    } catch (error) {
      logger.error(`Error updating post ${id}:`, error);
      throw error;
    }
  }

  async deletePost(id) {
    try {
      const response = await axios.delete(`${this.baseUrl}/posts/${id}`, {
        auth: this.auth
      });
      return response.data;
    } catch (error) {
      logger.error(`Error deleting post ${id}:`, error);
      throw error;
    }
  }

  async getCategories() {
    try {
      const response = await axios.get(`${this.baseUrl}/categories`, {
        auth: this.auth
      });
      return response.data;
    } catch (error) {
      logger.error('Error fetching categories:', error);
      throw error;
    }
  }

  async getTags() {
    try {
      const response = await axios.get(`${this.baseUrl}/tags`, {
        auth: this.auth
      });
      return response.data;
    } catch (error) {
      logger.error('Error fetching tags:', error);
      throw error;
    }
  }

  async getMedia() {
    try {
      const response = await axios.get(`${this.baseUrl}/media`, {
        auth: this.auth
      });
      return response.data;
    } catch (error) {
      logger.error('Error fetching media:', error);
      throw error;
    }
  }

  async uploadMedia(file, data = {}) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const response = await axios.post(`${this.baseUrl}/media`, formData, {
        auth: this.auth,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      logger.error('Error uploading media:', error);
      throw error;
    }
  }

  async getUsers() {
    try {
      const response = await axios.get(`${this.baseUrl}/users`, {
        auth: this.auth
      });
      return response.data;
    } catch (error) {
      logger.error('Error fetching users:', error);
      throw error;
    }
  }

  async getComments(postId) {
    try {
      const response = await axios.get(`${this.baseUrl}/comments`, {
        params: {
          post: postId
        },
        auth: this.auth
      });
      return response.data;
    } catch (error) {
      logger.error(`Error fetching comments for post ${postId}:`, error);
      throw error;
    }
  }
}

// Routes
app.post('/api/wordpress/connect', async (req, res) => {
  try {
    const { siteUrl, username, password } = req.body;
    
    const client = new WordPressClient(siteUrl, username, password);
    
    // Test de connectie door posts op te halen
    await client.getPosts(1, 1);
    
    // Sla de connectie gegevens op in MongoDB
    await db.collection('wordpress_connections').updateOne(
      { siteUrl },
      {
        $set: {
          username,
          password: password, // In productie zou je dit moeten encrypten
          lastConnected: new Date()
        }
      },
      { upsert: true }
    );

    res.json({ success: true, message: 'Verbinding succesvol' });
  } catch (error) {
    logger.error('Connection error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/wordpress/:site/posts', async (req, res) => {
  try {
    const { site } = req.params;
    const { page = 1, perPage = 10 } = req.query;
    
    // Haal connectie gegevens op uit MongoDB
    const connection = await db.collection('wordpress_connections').findOne({ siteUrl: site });
    if (!connection) {
      return res.status(404).json({ error: 'Site niet gevonden' });
    }

    const client = new WordPressClient(site, connection.username, connection.password);
    const posts = await client.getPosts(page, perPage);
    
    res.json(posts);
  } catch (error) {
    logger.error('Error fetching posts:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/wordpress/:site/posts', async (req, res) => {
  try {
    const { site } = req.params;
    const postData = req.body;
    
    const connection = await db.collection('wordpress_connections').findOne({ siteUrl: site });
    if (!connection) {
      return res.status(404).json({ error: 'Site niet gevonden' });
    }

    const client = new WordPressClient(site, connection.username, connection.password);
    const post = await client.createPost(postData);
    
    res.json(post);
  } catch (error) {
    logger.error('Error creating post:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/wordpress/:site/posts/:id', async (req, res) => {
  try {
    const { site, id } = req.params;
    const postData = req.body;
    
    const connection = await db.collection('wordpress_connections').findOne({ siteUrl: site });
    if (!connection) {
      return res.status(404).json({ error: 'Site niet gevonden' });
    }

    const client = new WordPressClient(site, connection.username, connection.password);
    const post = await client.updatePost(id, postData);
    
    res.json(post);
  } catch (error) {
    logger.error('Error updating post:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/wordpress/:site/posts/:id', async (req, res) => {
  try {
    const { site, id } = req.params;
    
    const connection = await db.collection('wordpress_connections').findOne({ siteUrl: site });
    if (!connection) {
      return res.status(404).json({ error: 'Site niet gevonden' });
    }

    const client = new WordPressClient(site, connection.username, connection.password);
    const result = await client.deletePost(id);
    
    res.json(result);
  } catch (error) {
    logger.error('Error deleting post:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/wordpress/:site/categories', async (req, res) => {
  try {
    const { site } = req.params;
    
    const connection = await db.collection('wordpress_connections').findOne({ siteUrl: site });
    if (!connection) {
      return res.status(404).json({ error: 'Site niet gevonden' });
    }

    const client = new WordPressClient(site, connection.username, connection.password);
    const categories = await client.getCategories();
    
    res.json(categories);
  } catch (error) {
    logger.error('Error fetching categories:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/wordpress/:site/tags', async (req, res) => {
  try {
    const { site } = req.params;
    
    const connection = await db.collection('wordpress_connections').findOne({ siteUrl: site });
    if (!connection) {
      return res.status(404).json({ error: 'Site niet gevonden' });
    }

    const client = new WordPressClient(site, connection.username, connection.password);
    const tags = await client.getTags();
    
    res.json(tags);
  } catch (error) {
    logger.error('Error fetching tags:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/wordpress/:site/media', async (req, res) => {
  try {
    const { site } = req.params;
    
    const connection = await db.collection('wordpress_connections').findOne({ siteUrl: site });
    if (!connection) {
      return res.status(404).json({ error: 'Site niet gevonden' });
    }

    const client = new WordPressClient(site, connection.username, connection.password);
    const media = await client.getMedia();
    
    res.json(media);
  } catch (error) {
    logger.error('Error fetching media:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/wordpress/:site/media', async (req, res) => {
  try {
    const { site } = req.params;
    const { file, ...data } = req.body;
    
    const connection = await db.collection('wordpress_connections').findOne({ siteUrl: site });
    if (!connection) {
      return res.status(404).json({ error: 'Site niet gevonden' });
    }

    const client = new WordPressClient(site, connection.username, connection.password);
    const media = await client.uploadMedia(file, data);
    
    res.json(media);
  } catch (error) {
    logger.error('Error uploading media:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// MongoDB connectie en server start
MongoClient.connect(mongoUrl)
  .then(client => {
    db = client.db(dbName);
    logger.info('Connected to MongoDB');
    
    app.listen(port, () => {
      logger.info(`WordPress integration service running on port ${port}`);
    });
  })
  .catch(error => {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Error handling
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

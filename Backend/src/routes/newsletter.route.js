const express = require('express');
const { 
  subscribeNewsletter, 
  unsubscribeNewsletter, 
  getSubscribers 
} = require('../controllers/newsletter.controller');

const router = express.Router();

// Public routes
router.post('/subscribe', subscribeNewsletter);
router.post('/unsubscribe', unsubscribeNewsletter);

// Protected route - get all subscribers (admin only)
router.get('/subscribers', getSubscribers);

module.exports = router;

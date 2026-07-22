const Newsletter = require('../models/newsletter');

const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    // Check if email already exists
    const existingSubscriber = await Newsletter.findOne({ email: email.toLowerCase() });
    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return res.status(400).json({ message: 'This email is already subscribed' });
      }
      // Reactivate subscription
      existingSubscriber.isActive = true;
      await existingSubscriber.save();
      return res.status(200).json({ 
        message: 'Welcome back! You have been resubscribed.',
        data: existingSubscriber 
      });
    }

    // Create new subscription
    const newSubscriber = new Newsletter({ email: email.toLowerCase() });
    await newSubscriber.save();

    res.status(201).json({
      message: 'Successfully subscribed to newsletter!',
      data: newSubscriber,
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'This email is already subscribed' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }
    res.status(500).json({ message: 'Failed to subscribe. Please try again.' });
  }
};

const unsubscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const subscriber = await Newsletter.findOne({ email: email.toLowerCase() });
    if (!subscriber) {
      return res.status(404).json({ message: 'Email not found in subscriber list' });
    }

    subscriber.isActive = false;
    await subscriber.save();

    res.status(200).json({
      message: 'Successfully unsubscribed from newsletter',
      data: subscriber,
    });
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    res.status(500).json({ message: 'Failed to unsubscribe. Please try again.' });
  }
};

const getSubscribers = async (req, res) => {
  try {
    const subscribers = await Newsletter.find({ isActive: true }).sort({ subscribedAt: -1 });
    res.status(200).json({
      message: 'Subscribers fetched successfully',
      data: subscribers,
      count: subscribers.length,
    });
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    res.status(500).json({ message: 'Failed to fetch subscribers' });
  }
};

module.exports = { subscribeNewsletter, unsubscribeNewsletter, getSubscribers };

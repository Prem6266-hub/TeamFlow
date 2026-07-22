import api from './api';

export const subscribeToNewsletter = async (email) => {
  return api.post('/api/newsletter/subscribe', { email });
};

export const unsubscribeFromNewsletter = async (email) => {
  return api.post('/api/newsletter/unsubscribe', { email });
};

export const getSubscribers = async () => {
  return api.get('/api/newsletter/subscribers');
};

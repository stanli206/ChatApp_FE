import axios from 'axios';

const API_URL = 'https://notebookchat.onrender.com/api/chat';

const getUsers = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(`${API_URL}/users`, config);
  return response.data;
};

const getMessages = async (userId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(`${API_URL}/messages/${userId}`, config);
  return response.data;
};

const sendMessage = async (messageData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.post(`${API_URL}/messages`, messageData, config);
  return response.data;
};

export default { getUsers, getMessages, sendMessage };
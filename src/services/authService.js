import axios from 'axios';

const API_URL = 'https://notebookchat.onrender.com/api/auth';

const register = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  return response.data;
};

const login = async (userData) => {
  const response = await axios.post(`${API_URL}/login`, userData);
  return response.data;
};

const logout = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  await axios.post(`${API_URL}/logout`, {}, config);
};

export default { register, login, logout };
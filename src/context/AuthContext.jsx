import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    setUser(userInfo);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      const newSocket = io('https://notebookchat.onrender.com', { //http://localhost:5000
        query: { userId: user._id },
      });
      setSocket(newSocket);

      return () => newSocket.close();
    }
  }, [user]);

  const login = async (email, password) => {
    try {
      const { data } = await axios.post('https://notebookchat.onrender.com/api/auth/login', {
        email,
        password,
      });
      localStorage.setItem('userInfo', JSON.stringify(data));
      setUser(data);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await axios.post('https://notebookchat.onrender.com/api/auth/register', {
        name,
        email,
        password,
      });
      localStorage.setItem('userInfo', JSON.stringify(data));
      setUser(data);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        'https://notebookchat.onrender.com/api/auth/logout',
        {},
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      localStorage.removeItem('userInfo');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, socket, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
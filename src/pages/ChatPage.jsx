import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserList from '../components/UserList';
import ChatContainer from '../components/ChatContainer';

const ChatPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/4 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Chat App</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Logout
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <UserList onSelectUser={setSelectedUser} />
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <ChatContainer selectedUser={selectedUser} />
      </div>
    </div>
  );
};

export default ChatPage;
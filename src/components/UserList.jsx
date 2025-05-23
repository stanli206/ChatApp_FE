import { useEffect, useState } from 'react';
import { FiUser } from 'react-icons/fi';
import chatService from '../services/chatService';
import { useAuth } from '../context/AuthContext';

const UserList = ({ onSelectUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await chatService.getUsers(user.token);
        setUsers(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user.token]);

  if (loading) {
    return <div className="p-4">Loading users...</div>;
  }

  return (
    <div className="overflow-y-auto h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Users</h2>
      </div>
      <ul>
        {users.map((userItem) => (
          <li
            key={userItem._id}
            className="p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer flex items-center"
            onClick={() => onSelectUser(userItem)}
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                <FiUser className="text-gray-600" />
              </div>
              {userItem.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            <div className="ml-3">
              <p className="font-medium">{userItem.name}</p>
              <p className="text-sm text-gray-500">
                {userItem.isOnline ? 'Online' : `Last seen ${new Date(userItem.lastSeen).toLocaleTimeString()}`}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
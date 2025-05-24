import { useState, useEffect, useRef } from 'react';
import Message from './Message';
import chatService from '../services/chatService';
import { useAuth } from '../context/AuthContext';

const ChatContainer = ({ selectedUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { user, socket } = useAuth();
  const messagesEndRef = useRef(null);

  // Fetch messages when selectedUser changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedUser) {
        try {
          const data = await chatService.getMessages(selectedUser._id, user.token);
          setMessages(data);
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      }
    };

    fetchMessages();
  }, [selectedUser, user.token]);

  // Join user's room when socket connects
  useEffect(() => {
    if (socket && user?._id) {
      socket.emit('join', user._id);
    }
  }, [socket, user?._id]);

  // Handle incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (message) => {
      setMessages(prev => {
        // Check if message already exists to prevent duplicates
        const messageExists = prev.some(m => m._id === message._id);
        if (!messageExists) {
          return [...prev, message];
        }
        return prev;
      });
    };

    socket.on('receiveMessage', handleReceiveMessage);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
    };
  }, [socket]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || isSending) return;

    setIsSending(true);
    const tempId = Date.now().toString(); // Temporary ID for optimistic update

    try {
      // Optimistically add message to UI
      setMessages(prev => [...prev, {
        _id: tempId,
        sender: { _id: user._id, name: user.name },
        receiver: { _id: selectedUser._id, name: selectedUser.name },
        message: newMessage,
        createdAt: new Date().toISOString(),
        isRead: false,
        __v: 0
      }]);

      setNewMessage('');

      // Send to server
      const sentMessage = await chatService.sendMessage({
        receiver: selectedUser._id,
        message: newMessage
      }, user.token);

      // Replace optimistic message with real message from server
      setMessages(prev => prev.map(msg => 
        msg._id === tempId ? sentMessage : msg
      ));

      // Emit via socket
      socket.emit('sendMessage', {
        senderId: user._id,
        receiverId: selectedUser._id,
        message: newMessage
      });

    } catch (error) {
      console.error('Error sending message:', error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg._id !== tempId));
    } finally {
      setIsSending(false);
    }
  };

  if (!selectedUser) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center p-6">
          <h3 className="text-lg font-medium text-gray-900">Select a user to start chatting</h3>
          <p className="mt-2 text-sm text-gray-500">Choose from the list to begin your conversation</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="p-4 border-b border-gray-200 flex items-center">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-gray-600">{selectedUser.name.charAt(0)}</span>
          </div>
          {selectedUser.isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          )}
        </div>
        <div className="ml-3">
          <p className="font-medium">{selectedUser.name}</p>
          <p className="text-sm text-gray-500">
            {selectedUser.isOnline ? 'Online' : `Last seen ${new Date(selectedUser.lastSeen).toLocaleTimeString()}`}
          </p>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.map((message) => (
          <Message
            key={`${message._id}-${message.createdAt}`}
            message={message}
            isCurrentUser={message.sender._id === user._id}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
        <div className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSending}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={isSending}
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatContainer;

// import { useState, useEffect, useRef } from 'react';
// import Message from './Message';
// import chatService from '../services/chatService';
// import { useAuth } from '../context/AuthContext';

// const ChatContainer = ({ selectedUser }) => {
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState('');
//   const { user, socket } = useAuth();
//   const messagesEndRef = useRef(null);

//   // Fetch messages when selectedUser changes
//   useEffect(() => {
//     const fetchMessages = async () => {
//       if (selectedUser) {
//         try {
//           const data = await chatService.getMessages(selectedUser._id, user.token);
//           setMessages(data);
//         } catch (error) {
//           console.error('Error fetching messages:', error);
//         }
//       }
//     };

//     fetchMessages();
//   }, [selectedUser, user.token]);

//   // Join user's room when socket connects
//   useEffect(() => {
//     if (socket && user?._id) {
//       socket.emit('join', user._id);
//     }
//   }, [socket, user?._id]);

//   // Handle incoming messages
//   // Handle incoming messages
// useEffect(() => {
//   if (!socket) return;

//   const handleReceiveMessage = (message) => {
//     setMessages((prev) => {
//       // Check if message already exists (prevent duplicates)
//       const exists = prev.some(m => m._id === message._id);
//       if (!exists) {
//         return [...prev, message];
//       }
//       return prev;
//     });
//   };

//   socket.on('receiveMessage', handleReceiveMessage);

//   return () => {
//     socket.off('receiveMessage', handleReceiveMessage);
//   };
// }, [socket]);

// // Modified send message handler
// const handleSendMessage = async (e) => {
//   e.preventDefault();
//   if (!newMessage.trim() || !selectedUser) return;

//   try {
//     const messageData = {
//       receiver: selectedUser._id,
//       message: newMessage,
//     };

//     // Optimistically update UI
//     const tempId = Date.now(); // Temporary ID for optimistic update
//     const optimisticMessage = {
//       _id: tempId,
//       sender: { _id: user._id, name: user.name },
//       receiver: { _id: selectedUser._id, name: selectedUser.name },
//       message: newMessage,
//       createdAt: new Date(),
//       isRead: false,
//       __v: 0
//     };

//     setMessages(prev => [...prev, optimisticMessage]);
//     setNewMessage('');

//     // Send to server
//     const sentMessage = await chatService.sendMessage(messageData, user.token);
    
//     // Replace optimistic message with real one
//     setMessages(prev => prev.map(m => 
//       m._id === tempId ? sentMessage : m
//     ));

//     // Emit via socket
//     socket.emit('sendMessage', {
//       ...sentMessage,
//       sender: { _id: user._id, name: user.name },
//       receiver: { _id: selectedUser._id, name: selectedUser.name }
//     });

//   } catch (error) {
//     console.error('Error sending message:', error);
//     // Remove optimistic message on error
//     setMessages(prev => prev.filter(m => m._id !== tempId));
//   }
// };

//   if (!selectedUser) {
//     return (
//       <div className="flex items-center justify-center h-full bg-gray-50">
//         <div className="text-center p-6">
//           <h3 className="text-lg font-medium text-gray-900">Select a user to start chatting</h3>
//           <p className="mt-2 text-sm text-gray-500">Choose from the list to begin your conversation</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col h-full">
//       {/* Chat header */}
//       <div className="p-4 border-b border-gray-200 flex items-center">
//         <div className="relative">
//           <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
//             <span className="text-gray-600">{selectedUser.name.charAt(0)}</span>
//           </div>
//           {selectedUser.isOnline && (
//             <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
//           )}
//         </div>
//         <div className="ml-3">
//           <p className="font-medium">{selectedUser.name}</p>
//           <p className="text-sm text-gray-500">
//             {selectedUser.isOnline ? 'Online' : `Last seen ${new Date(selectedUser.lastSeen).toLocaleTimeString()}`}
//           </p>
//         </div>
//       </div>

//       {/* Messages area */}
//       <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
//         {messages.map((message) => (
//           <Message
//             key={message._id || `${message.sender._id}-${Date.now()}`}
//             message={message}
//             isCurrentUser={message.sender._id === user._id}
//           />
//         ))}
//         <div ref={messagesEndRef} />
//       </div>

//       {/* Message input */}
//       <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
//         <div className="flex">
//           <input
//             type="text"
//             value={newMessage}
//             onChange={(e) => setNewMessage(e.target.value)}
//             placeholder="Type a message..."
//             className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//           />
//           <button
//             type="submit"
//             className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
//           >
//             Send
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default ChatContainer;
import React, { useContext, useEffect, useState } from 'react';
import './Chat.css';
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar';
import ChatBox from '../../components/ChatBox/ChatBox';
import RightSidebar from '../../components/RightSidebar/RightSidebar';
import { AppContext } from '../../context/AppContext';

const Chat = () => {
  const { chatData, userData, chatUser } = useContext(AppContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (chatData && userData) {
      setLoading(false);
    }
  }, [chatData, userData]);

  return (
    <div className='chat'>
      {loading ? (
        <p className='loading'>Loading....</p>
      ) : (
        <div className="chat-container">
          <LeftSidebar />
          <ChatBox key={chatUser?.id || "default"} /> {/* Ensures re-render when user changes */}
          <RightSidebar />
        </div>
      )}
    </div>
  );
};

export default Chat;

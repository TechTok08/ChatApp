import React, { useContext, useEffect, useMemo, useState } from 'react';
import './RightSidebar.css';
import assets from '../../assets/assets';
import { logout } from '../../config/firebase';
import { AppContext } from '../../context/AppContext';

const RightSidebar = () => {
  const { chatUser, messages, setIsUserBlocked } = useContext(AppContext);
  const [isBlocked, setIsBlocked] = useState(false);

  // Extract media images from messages using useMemo for optimization
  const msgImages = useMemo(
    () => messages.filter((msg) => msg.image).map((msg) => msg.image),
    [messages]
  );

  const toggleBlockUser = () => {
    setIsBlocked((prev) => {
      const newState = !prev;
      
      // ✅ Defer state update using useEffect
      setTimeout(() => {
        setIsUserBlocked(chatUser?.userData?.id, newState);
      }, 0);
  
      return newState;
    });
  };
  

  useEffect(() => {
    if (chatUser) {
      setIsUserBlocked(chatUser?.userData?.id, isBlocked);
    }
  }, [isBlocked]);
  
  return chatUser ? (
    <div className='rs'>
      <div className='rs-profile'>
        <img src={chatUser?.userData?.avatar || assets.default_avatar} alt='User Avatar' />
        <h3>
          {Date.now() - (chatUser?.userData?.lastSeen || 0) <= 70000 && (
            <img src={assets.green_dot} className='dot' alt='Online Indicator' />
          )}{' '}
          {chatUser?.userData?.name || 'Unknown User'}
        </h3>
        <p>{chatUser?.userData?.bio || 'No bio available'}</p>
      </div>
      <hr />
      <div className='rs-media'>
        <p>Media</p>
        <div>
          {msgImages.length > 0 ? (
            msgImages.map((url, index) => (
              <img onClick={() => window.open(url)} key={index} src={url} alt='Media' />
            ))
          ) : (
            <p></p>
          )}
        </div>
      </div>
      <div className='rs-buttons'>
        {/* <button onClick={toggleBlockUser}>
          {isBlocked ? 'Unblock User' : 'Block User'}
        </button> */}
      </div>
      <div className='rs-log'>
        <button onClick={logout}>Logout</button>
      </div>
    </div>
  ) : (
    <div className='rs'>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default RightSidebar;

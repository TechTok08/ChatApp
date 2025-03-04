import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { createContext, useEffect, useState } from "react";
import { auth, db } from "../config/firebase";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [chatData, setChatData] = useState(null);
    const [messagesId, setMessagesId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [chatUser, setChatUser] = useState(null);
    const [chatVissible,setChatVissible] = useState(false);
    const [blockedUsers, setBlockedUsers] = useState({});

  // Function to block/unblock users
  const setIsUserBlocked = (userId, isBlocked) => {
    setBlockedUsers((prev) => {
      const updatedState = {
        ...prev,
        [userId]: isBlocked,
      };
      console.log("Updated Blocked Users:", updatedState); // ✅ Log full state
      return updatedState;
    });
  };
  

    // Function to load user data when user logs in
    const loadUserData = async (uid) => {
        try {
            const userRef = doc(db, "users", uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                console.error("User data not found!");
                return;
            }

            const userData = userSnap.data();
            setUserData(userData);

            // Navigate based on user profile completeness
            if (userData.avatar && userData.name) {
                navigate('/chat');
            } else {
                navigate('/profile');
            }

            // Update last seen
            await updateDoc(userRef, { lastSeen: Date.now() });
            setInterval(async () => {
                if(auth.chatUser){
                    await updateDoc(userRef, { lastSeen: Date.now() });
                }
            }, 60000);
        } catch (error) {
            console.error("Error loading user data:", error);
        }
    };

    // Update last seen every minute
    useEffect(() => {
        if (!userData) return;

        const userRef = doc(db, "users", userData.id);

        const updateLastSeen = async () => {
            await updateDoc(userRef, { lastSeen: Date.now() });
        };

        const interval = setInterval(updateLastSeen, 60000);

        return () => clearInterval(interval); // Cleanup interval on unmount
    }, [userData]); // Runs only when userData changes

    // Fetch chat data when userData is set
    useEffect(() => {
        if (userData){

        const chatRef = doc(db, 'chats', userData.id);
        
        const unSub = onSnapshot(chatRef, async (res) => {
            // if (!res.exists()) {
            //     setChatData([]);
            //     return;
            // }

            const chatItems = res.data().chatsData;

            const tempData = [];
               for(const item of chatItems){
                const userRef = doc(db,'users',item.rId);
                const userSnap = await getDoc(userRef);
                const userData = userSnap.data();
                tempData.push({...item,userData})
               }
            

            setChatData(tempData.sort((a, b) => b.updatedAt - a.updatedAt));
        });

        return () => { 
            unSub(); // Cleanup subscription on unmount
        }
    }
    }, [userData]);

    // ✅ Function to handle selecting a chat user
    const handleSelectChat = async (selectedUser) => {
        if (!selectedUser || !selectedUser.rId) {
            console.error("Selected user is invalid:", selectedUser);
            return;
        }

        try {
            // Fetch user data of the selected chat user
            const userRef = doc(db, 'users', selectedUser.rId);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                console.error("Selected chat user not found in database!");
                return;
            }

            const selectedUserData = userSnap.data();

            setChatUser({
                ...selectedUser,
                userData: selectedUserData
            });

            // Set messages ID for fetching messages
            setMessagesId(selectedUser.messagesId);

            console.log("Chat user set successfully:", selectedUserData);
        } catch (error) {
            console.error("Error selecting chat user:", error);
        }
    };

    // Context value for global state management
    const value = {
        userData, setUserData,
        chatData, setChatData,
        loadUserData,
        messages, setMessages,
        messagesId, setMessagesId,
        chatUser, setChatUser,
        chatVissible, setChatVissible,
        blockedUsers, setBlockedUsers,
        setIsUserBlocked,
        handleSelectChat // ✅ Add this so other components can use it
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export default AppContextProvider;

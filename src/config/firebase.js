import { initializeApp } from "firebase/app";
import { 
  createUserWithEmailAndPassword, 
  getAuth, 
  sendPasswordResetEmail, 
  signInWithEmailAndPassword, 
  signOut 
} from "firebase/auth";
import { 
  getFirestore, 
  setDoc, 
  doc, 
  serverTimestamp, 
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";
import { collapseToast, toast } from "react-toastify";
import axios from "axios"; // Import axios for Cloudinary API calls

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyArg_ivORxT3bOjR_YNI5V92W1g_mpx_yU",
  authDomain: "chat-app-gs-a5534.firebaseapp.com",
  projectId: "chat-app-gs-a5534",
  storageBucket: "chat-app-gs-a5534.appspot.com", // Fixed storage bucket
  messagingSenderId: "854437497589",
  appId: "1:854437497589:web:ce0d02f04097aa274ed3bc"
};

// Cloudinary configuration
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dxeq7qgiy/image/upload";
const CLOUDINARY_UPLOAD_PRESET = "chat_app_upload"; // Replace with your Cloudinary preset

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Function to upload image to Cloudinary
const uploadImageToCloudinary = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const response = await axios.post(CLOUDINARY_URL, formData);
    return response.data.secure_url; // Cloudinary URL for the uploaded image
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    toast.error("Image upload failed");
    return ""; // Return empty string if upload fails
  }
};

// Signup Function
const signup = async (username, email, password, imageFile) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;

    // Upload image to Cloudinary
    let avatarUrl = "";
    if (imageFile) {
      avatarUrl = await uploadImageToCloudinary(imageFile);
    }

    // Store user details in Firestore
    await setDoc(doc(db, "users", user.uid), {
      id: user.uid,
      username: username.toLowerCase(),
      email,
      name: "",
      avatar: avatarUrl, // Store Cloudinary image URL
      bio: "Hey, I'm using chat app",
      lastSeen: serverTimestamp()
    });

    // Initialize user chats
    await setDoc(doc(db, "chats", user.uid), {
      chatsData: []
    });

    toast.success("Signup successful!");
  } catch (error) {
    console.error("Signup Error:", error);
    toast.error(error.message);
  }
};

// Login Function
const login = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    toast.success("Login successful!");
  } catch (error) {
    console.error("Login Error:", error);
    toast.error(error.message);
  }
};

// Logout Function
const logout = async () => {
  try {
    await signOut(auth);
    toast.success("Logged out successfully!");
  } catch (error) {
    console.error("Logout Error:", error);
    toast.error(error.message);
  }
};

const resetPass = async(email) =>{
  if(!email){
    toast.error("Enter your email");
    return null;
  }
  try {
    const userRef = collection(db,'users');
    const q = query(userRef,where("email","==",email));
    const querySnap  = await getDocs(q);
    if (!querySnap.empty) {
      await sendPasswordResetEmail(auth,email);
      toast.success("Reset Email Sent..😉")
    }
    else{
      toast.error("Email doesn't exists..👀");
    }
  } catch (error) {
    console.error(error);
    toast.error(error.message);
  }
}

export { signup, login, logout, auth, db ,resetPass };

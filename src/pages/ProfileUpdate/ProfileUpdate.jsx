import React, { useContext, useEffect, useState } from "react";
import "./ProfileUpdate.css";
import assets from "../../assets/assets";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {uploadImageToCloudinary} from "../../lib/upload"; // Cloudinary upload function
import { AppContext } from "../../context/AppContext";

const ProfileUpdate = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [uid, setUid] = useState("");
  const [prevImage, setPrevImage] = useState("");
  const {setUserData} = useContext(AppContext)

  // Handle profile update
  const profileUpdate = async (event) => {
    event.preventDefault();
    if (!prevImage && !image) {
      toast.error("Upload a profile picture");
      return;
    }

    try {
      const docRef = doc(db, "users", uid);
      let imgUrl = prevImage;

      // Upload new image if changed
      if (image) {
        imgUrl = await uploadImageToCloudinary(image);
        setPrevImage(imgUrl);
          // Update Firestore user document
        await updateDoc(docRef, {
          avatar: imgUrl,
          bio: bio,
          name: name,
        });
      }
      else{
        await updateDoc(docRef, {
          bio: bio,
          name: name,
        });
      }
      toast.success("Profile updated successfully!");

    
     

      

      const snap = await getDoc(docRef);
      setUserData(snap.data());
      navigate('/chat');
    } catch (error) {
      toast.error("Failed to update profile.");
      console.error("Profile update error:", error);
    }
  };

  // Fetch user data on component mount
  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setName(userData.name || "");
          setBio(userData.bio || "");
          setPrevImage(userData.avatar || "");
        }
      } else {
        navigate("/");
      }
    });
  }, [navigate]);

  return (
    <div className="profile">
      <div className="profile-container">
        <form onSubmit={profileUpdate}>
          <h3>Profile Details</h3>

          {/* Profile Image Upload */}
          <label htmlFor="avatar">
            <input
              type="file"
              id="avatar"
              accept=".png, .jpeg, .jpg .webp"
              hidden
              onChange={(e) => setImage(e.target.files[0])}
            />
            <img
              src={image ? URL.createObjectURL(image) : prevImage ? prevImage : assets.avatar_icon}
              alt="Profile"
            />
            Upload profile image
          </label>

          {/* Name Input */}
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          {/* Bio Input */}
          <textarea
            placeholder="Write profile bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            required
          ></textarea>

          {/* Submit Button */}
          <button type="submit">Save</button>
        </form>

        {/* Profile Picture Preview */}
        <img
          className="profile-pic"
          src={image ? URL.createObjectURL(image) : prevImage ? prevImage : assets.logo_icon}
          alt="Profile"
        />
      </div>
    </div>
  );
};

export default ProfileUpdate;

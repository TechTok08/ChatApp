export const uploadImageToCloudinary = async (file) => {
    const CLOUD_NAME = "djakohfws"; // Replace with your Cloudinary Cloud Name
    const UPLOAD_PRESET = "chat_app_upload"; // Replace with your actual Upload Preset name

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
            {
                method: "POST",
                body: formData,
            }
        );

        if (!response.ok) {
            throw new Error("Failed to upload image to Cloudinary");
        }

        const data = await response.json();
        return data.secure_url; // Returns the URL of the uploaded image
    } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        throw error;
    }
};

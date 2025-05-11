export const handleFileUpload = async (file: File): Promise<string | null> => {
  const uploadData = new FormData();
  uploadData.append("file", file);
  uploadData.append("upload_preset", "warehouse"); // Replace with your actual preset

  try {
    const cloudinaryRes = await fetch(
      "https://api.cloudinary.com/v1_1/dqboora0r/auto/upload", // Replace with your Cloudinary cloud name
      {
        method: "POST",
        body: uploadData,
      }
    );

    const cloudinaryJson = await cloudinaryRes.json();

    if (!cloudinaryRes.ok || !cloudinaryJson.secure_url) {
      throw new Error(cloudinaryJson.error?.message || "Cloudinary upload failed");
    }

    return cloudinaryJson.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return null;
  }
};

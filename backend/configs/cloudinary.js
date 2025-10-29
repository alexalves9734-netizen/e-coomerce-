import { v2 as cloudinary } from "cloudinary";

const connectCloudinary = async () => {
  const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARYNAME || "").trim();
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  console.log("Cloudinary Config:", {
    cloud_name: cloudName,
    api_key: apiKey ? "***" + apiKey.slice(-4) : "undefined",
    api_secret: apiSecret ? "***" + apiSecret.slice(-4) : "undefined"
  });

  if (!cloudName || !apiKey || !apiSecret) {
    console.error("Cloudinary configuration missing:", {
      cloud_name: !!cloudName,
      api_key: !!apiKey,
      api_secret: !!apiSecret
    });
    return;
  }

  try {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
    
    // Test the connection
    const result = await cloudinary.api.ping();
    console.log("Cloudinary connection successful:", result);
  } catch (error) {
    console.error("Cloudinary connection failed:", {
      message: error.message,
      error: error,
      stack: error.stack
    });
  }
};

export default connectCloudinary;

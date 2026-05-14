const cloudinary = require('../config/cloudinary');

/**
 * Uploads a raw RAM buffer (from Multer memory storage) directly to Cloudinary.
 * @param {Buffer} fileBuffer The file buffer from req.file.buffer
 * @param {String} folderName Destination folder on Cloudinary
 * @returns {Promise} Resolves to Cloudinary upload result containing 'secure_url' and 'public_id'
 */
exports.uploadToCloudinary = (fileBuffer, folderName) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        folder: `placement_portal/${folderName}`,
        resource_type: 'auto' // automatically detect image, pdf, raw, etc.
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary Upload Stream Error:', error);
          return reject(error);
        }
        resolve(result);
      }
    );
    
    // Write buffer contents and finalize the stream
    uploadStream.end(fileBuffer);
  });
};

/**
 * Deletes a media asset from Cloudinary vault by public_id.
 * @param {String} publicId The asset's public ID in Cloudinary
 * @returns {Promise}
 */
exports.deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return null;
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary Asset Deletion Error:', error);
    throw error;
  }
};

const { writeFile, mkdir, unlink } = require('fs/promises');
const { join } = require('path');
const express = require('express');
const fileUpload = require('express-fileupload');

const router = express.Router();

router.use(fileUpload());

async function uploadFile(file, folder, name) {
  if (!file) {
    throw new Error('No file uploaded');
  }

  const buffer = file.data;

  const uploadDir = join(process.cwd(), 'public/uploads', folder);
  
  try {
    await mkdir(uploadDir, { recursive: true });
    const uploadPath = join(uploadDir, name);
    await writeFile(uploadPath, buffer);
    return `/uploads/${folder}/${name}`;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

// New function to update the image
async function updateImage(oldImagePath, newFile, folder, name) {
  if (!newFile) {
    throw new Error('No new file uploaded');
  }

  const oldImageFullPath = join(process.cwd(), 'public', oldImagePath);
  
  try {
    // Delete the old image
    await unlink(oldImageFullPath);
    // Upload the new image
    return await uploadFile(newFile, folder, name);
  } catch (error) {
    console.error('Error updating image:', error);
    throw error;
  }
}

router.post('/upload-image', async (req, res) => {
  try {
    // Check if files are present
    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: 'No files were uploaded.' });
    }

    const { image } = req.files;
    const { name, folder } = req.body;

    if (!name || !folder) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const url = await uploadFile(image, folder, name);
    return res.json({ url });
  } catch (error) {
    console.error('Error uploading image:', error);
    return res.status(500).json({ error: 'Failed to upload image' });
  }
});

router.post('/update-image', async (req, res) => {
  try {
    // Check if files are present
    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: 'No files were uploaded.' });
    }

    const { image } = req.files;
    const { name, folder, oldImagePath } = req.body;

    if (!name || !folder || !oldImagePath) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const url = await updateImage(oldImagePath, image, folder, name);
    return res.json({ url });
  } catch (error) {
    console.error('Error updating image:', error);
    return res.status(500).json({ error: 'Failed to update image' });
  }
});

module.exports = router;

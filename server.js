const express = require('express');
const { Storage } = require('@google-cloud/storage');
const app = express();
app.use(express.json());

// Initialise la connexion à Google Cloud Storage en utilisant le fichier de clé de service "clejson.json"
const storage = new Storage({
  keyFilename: './clejson.json',
});

const bucketName = 'ckoisa';

// Génère une URL signée pour l'upload (PUT)
async function generateV4UploadSignedUrl(fileName) {
  const options = {
    version: 'v4',
    action: 'write',
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    contentType: 'image/jpeg',
  };
 
  const [url] = await storage.bucket(bucketName).file(fileName).getSignedUrl(options);
  return url;
}

// Génère une URL signée pour la lecture (GET)
async function generateV4ReadSignedUrl(fileName) {
  const options = {
    version: 'v4',
    action: 'read',
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
  };

  const [url] = await storage.bucket(bucketName).file(fileName).getSignedUrl(options);
  return url;
}

// Endpoint pour générer l'URL signée pour l'upload
app.post('/generate-signed-url', async (req, res) => {
  try {
    const { fileName } = req.body;
    if (!fileName) {
      return res.status(400).json({ error: "fileName is required" });
    }
    const url = await generateV4UploadSignedUrl(fileName);
    res.json({ url });
  } catch (error) {
    console.error("Error generating upload signed URL:", error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint pour générer l'URL signée pour la lecture (optionnel)
app.post('/generate-read-url', async (req, res) => {
  try {
    const { fileName } = req.body;
    if (!fileName) {
      return res.status(400).json({ error: "fileName is required" });
    }
    const url = await generateV4ReadSignedUrl(fileName);
    res.json({ url });
  } catch (error) {
    console.error("Error generating read signed URL:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const textToSpeech = require('@google-cloud/text-to-speech');
require('dotenv').config();

const app = express();
const client = new textToSpeech.TextToSpeechClient();

app.use(cors({
  origin: 'http://127.0.0.1:5000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(bodyParser.json());

app.post('/tts', async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim().length === 0) {
    return res.status(400).send('Missing or empty text.');
  }

  const request = {
    input: { text },
    voice: {
      languageCode: 'en-US',
      // name: 'en-US-Wavenet-F',
      //  name: 'en-US-Studio-O',
      // name: 'en-US-Neural2-J',
      name: 'en-GB-Wavenet-B',
    },
    audioConfig: { audioEncoding: 'MP3' },
  };

  try {
    const [response] = await client.synthesizeSpeech(request);
    res.set('Content-Type', 'audio/mpeg');
    res.send(response.audioContent);
  } catch (err) {
    console.error('❌ TTS error:', err);
    res.status(500).send('Failed to synthesize speech.');
  }
});

app.get('/voices', async (req, res) => {
  try {
    const [result] = await client.listVoices({});
    const voices = result.voices.map(v => ({
      name: v.name,
      gender: v.ssmlGender,
      languageCodes: v.languageCodes,
    }));
    res.json(voices);
  } catch (err) {
    console.error('❌ Failed to list voices:', err);
    res.status(500).send('Unable to fetch voice list.');
  }
});

app.listen(3000, () => {
  console.log('✅ Server running at http://localhost:3000');
});



// $env:GOOGLE_APPLICATION_CREDENTIALS = "URL_PATH_TO_TEXT_TO_SPEECH_FILE"

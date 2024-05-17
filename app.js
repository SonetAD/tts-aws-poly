const express = require('express');
const app = express();

const port = 3000;

app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

const AWS = require('aws-sdk');

// Configure AWS SDK

AWS.config.update({
  region: 'client-region',
  accessKeyId: 'client-key',
  secretAccessKey: 'client-secreet',
});

const polly = new AWS.Polly();

app.get('/voices', async (req, res) => {
  try {
    const response = await polly.describeVoices({}).promise();
    const voices = response.Voices.map((voice) => ({
      Id: voice.Id,
      Name: voice.Name,
      LanguageCode: voice.LanguageCode,
    }));
    res.json(voices);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching voices');
  }
});

app.get('/synthesize', async (req, res) => {
  const { text, voiceId } = req.query;
  if (!text || !voiceId) {
    return res.status(400).send('Text and voiceId are required');
  }

  try {
    const params = {
      OutputFormat: 'mp3',
      Text: text,
      VoiceId: voiceId,
    };

    const response = await polly.synthesizeSpeech(params).promise();
    const audioUrl = `data:audio/mpeg;base64,${response.AudioStream.toString(
      'base64'
    )}`;

    res.send(
      `<audio controls><source src="${audioUrl}" type="audio/mpeg"></audio>`
    );
  } catch (error) {
    console.error(error);
    res.status(500).send('Error synthesizing speech');
  }
});

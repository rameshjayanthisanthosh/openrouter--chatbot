require('dotenv').config();
const express = require('express');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Rate limiting (100 requests per 15 mins per IP)
app.use('/api/chat', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

// Proxy endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': req.headers.referer || 'https://your-app.vercel.app',
        'X-Title': 'Public Chatbot'
      },
      body: JSON.stringify(req.body)
    });
    res.json(await response.json());
  } catch (error) {
    res.status(500).json({ error: "Server busy. Try again later." });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
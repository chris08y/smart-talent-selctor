import express from 'express';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

app.post('/api/ai', async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'OpenAI API key not configured. Create a .env file with OPENAI_API_KEY.'
    });
  }

  const prompt = req.body.prompt || 'Give smart hiring advice from the Smart Talent Selector app.';

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a talent selection AI assistant. Provide concise, practical hiring guidance and highlight candidate fit, strengths, and development gaps.'
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 400,
        temperature: 0.75
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message?.content?.trim() || 'AI did not return a response.';
    res.json({ message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Smart Talent Selector running at http://localhost:${PORT}`);
});

# Smart Talent Selector

A modern AI-integrated website for smart talent selection, candidate fit scoring, and hiring insights.

## What this project includes

- `public/index.html` — responsive UI for candidate entry and AI prompts
- `public/styles.css` — polished dark UI with unique gradients and cards
- `public/app.js` — local matching logic plus AI request flow
- `server.js` — Node server that serves the website and proxies AI requests
- `package.json` — install dependencies and run the app

## Step-by-step installation

1. Install Node.js 18 or later.
2. Open a terminal in the project folder:
   ```powershell
   cd "c:\Users\chris\OneDrive\Desktop\smart talent"
   ```
3. Install dependencies:
   ```powershell
   npm install
   ```
4. Create a `.env` file in the project root with your OpenAI key:
   ```text
   OPENAI_API_KEY=your_openai_api_key_here
   ```
5. Start the website:
   ```powershell
   npm start
   ```
6. Open your browser at:
   ```text
   http://localhost:3000
   ```

## How to use it

1. Enter the role, core skills, culture note, and candidate summary.
2. Click **Analyze fit** to calculate a live talent score.
3. Click **Ask AI** to generate hiring insight from OpenAI.
4. Use the AI prompt area to create custom summaries, interview questions, or development feedback.

## Optional customizations

- Change the OpenAI model in `server.js` from `gpt-3.5-turbo` to a newer model.
- Add more candidate cards by duplicating the form and display logic.
- Extend `computeMatch()` with weighted experience levels or skill categories.

## Notes

- The AI endpoint requires a valid OpenAI API key.
- If the AI service is unavailable, the website still provides local talent scoring.

const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Initialize CORS and bodyParser middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize Google Generative AI client
const geminiApiKey = process.env.GEMINI_API_KEY;
const googleAI = new GoogleGenerativeAI(geminiApiKey);
const geminiModel = googleAI.getGenerativeModel({
  model: "gemini-1.5-flash", 
});

// Endpoint to handle POST request for getting day status
app.post('/api/getDayStatus', async (req, res) => {
  const { data, prompt } = req.body;  // Expect `prompt` to be sent in the request body
  console.log("Received request data:", data);
  console.log("Received prompt:", prompt);

  // Prepare input for the Gemini model
  const geminiInput = `${prompt}\n\n` + data.map(item => {
    return `Source Node: ${item.sourceNodeData.name} (${item.sourceNodeData.code})\n` +
           `Target Node: ${item.targetNodeData.name} (${item.targetNodeData.code})\n`;
  }).join('\n\n');

  console.log("Formatted Gemini input:", geminiInput);

  try {
    // Call the Gemini API
    const result = await geminiModel.generateContent(geminiInput);

    // Log the API response for debugging
    console.log("Gemini API response:", result);

    // Assuming result.response contains the AI's response
    const aiResponse = result.response.text();

    // Send AI response to the client
    res.json({ aiResponse });
  } catch (error) {
    // Handle errors
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the Express server
const port = process.env.PORT || 5001;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

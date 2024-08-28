const express = require('express');
const axios = require('axios');
const stringSimilarity = require('string-similarity');

const app = express();
const port = 3000;

// Example behavior array
const behavior = [
  {
    question: 'How are you?',
    customReply: 'I am doing well, thank you!',
  },
  {
    question: 'What is your name?',
    customReply: 'My name is Goddess-Aesther!',
  },
  // Add more custom behaviors as needed
];

// Function to find the closest match in behavior array
function findClosestMatch(userQuestion) {
  const questionsArray = behavior.map(item => item.question.toLowerCase());
  const { bestMatch } = stringSimilarity.findBestMatch(userQuestion.toLowerCase(), questionsArray);

  // Adjust the similarity threshold as needed (e.g., 0.4 for lower similarity)
  if (bestMatch && bestMatch.rating > 0.4) {
    const index = bestMatch.targetIndex;
    return behavior[index];
  }

  return null; // Return null if there's no match or similarity is too low
}

let requestNumber = 0; // Initialize request number

// Serve the HTML file when accessing the root URL
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/api/hercai', async (req, res) => {
  try {
    requestNumber++; // Increment request number for each request
    console.log(`Request Number: ${requestNumber}`);

    const userQuestion = req.query.question;

    // Log the user's question
    console.log(`User's Question: ${userQuestion}`);

    // Find the closest match using string similarity with a lower threshold
    const closestMatch = findClosestMatch(userQuestion);

    // Check if closestMatch is defined
    if (closestMatch) {
      // Log that custom behavior is used
      console.log('Custom Behavior Used');

      // Return the custom reply
      res.json({ reply: closestMatch.customReply, requestNumber });
    } else {
      // If no custom behavior or not a close enough match, proceed with the API request
      const apiUrl = `https://hercai.onrender.com/v3/hercai?question=${encodeURIComponent(userQuestion)}`;
      const response = await axios.get(apiUrl);

      // Assuming the API response structure is as described
      const responseData = response.data;

      // Log that API response is used
      console.log('API Response Used');

      res.json({ reply: responseData.reply, requestNumber });
    }
  } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
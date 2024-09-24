const express = require('express');
const axios = require('axios');
const stringSimilarity = require('string-similarity');

const app = express();
const port = 3000;

// Font mapping
const fonts = {
  a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁", i: "𝗂",
  j: "𝗃", k: "𝗄", l: "𝗅", m: "𝗆", n: "𝗇", o: "𝗈", p: "𝗉", q: "𝗊", r: "𝗋",
  s: "𝗌", t: "𝗍", u: "𝗎", v: "𝗏", w: "𝗐", x: "𝗑", y: "𝗒", z: "𝗓",
  A: "𝗔", B: "𝗕", C: "𝗖", D: "𝗗", E: "𝗘", F: "𝗙", G: "𝗚", H: "𝗛", I: "𝗜",
  J: "𝗝", K: "𝗞", L: "𝗟", M: "𝗠", N: "𝗡", O: "𝗢", P: "𝗣", Q: "𝗤", R: "𝗥",
  S: "𝗦", T: "𝗧", U: "𝗨", V: "𝗩", W: "𝗪", X: "𝗫", Y: "𝗬", Z: "𝗭"
};

// Function to convert text to custom font
function applyFont(text) {
  return text.split('').map(char => fonts[char] || char).join('');
}

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
];

// Function to find the closest match in behavior array
function findClosestMatch(userQuestion) {
  const questionsArray = behavior.map(item => item.question.toLowerCase());
  const { bestMatch } = stringSimilarity.findBestMatch(userQuestion.toLowerCase(), questionsArray);

  if (bestMatch && bestMatch.rating > 0.4) {
    const index = bestMatch.targetIndex;
    return behavior[index];
  }
  return null;
}

let requestNumber = 0;

// Serve the HTML file when accessing the root URL
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/api/hercai', async (req, res) => {
  try {
    requestNumber++;
    console.log(`Request Number: ${requestNumber}`);

    const userQuestion = req.query.question;
    const RolePlay = "quand tu répond à cette question ajoutes des emojis convenable\n\n";

    console.log(`User's Question: ${userQuestion}`);

    const closestMatch = findClosestMatch(userQuestion);

    if (closestMatch) {
      console.log('Custom Behavior Used');
      const formattedReply = applyFont(closestMatch.customReply);
      res.json({ result: formattedReply, requestNumber });
    } else {
      const apiUrl = `https://api.chiwa.id/api/ai/blackbox?prompt=${encodeURIComponent(RolePlay + userQuestion)}`;
      const response = await axios.get(apiUrl);
      const responseData = response.data;

      if (responseData.status === 200) {
        console.log('API Response Used');
        const formattedReply = applyFont(responseData.result);
        res.json({ result: formattedReply, requestNumber });
      } else {
        res.status(500).json({ error: 'API returned an error', requestNumber });
      }
    }
  } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

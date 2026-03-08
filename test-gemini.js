require('dotenv').config();
const process = require('process');

async function listModels() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    const modelNames = data.models ? data.models.map(m => m.name).filter(name => name.includes('flash') || name.includes('pro')) : data;
    console.log(JSON.stringify(modelNames, null, 2));
}

listModels();

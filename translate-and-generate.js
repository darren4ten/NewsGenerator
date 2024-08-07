// translate-and-generate.js

const fetch = require('node-fetch');
const fs = require('fs');

async function fetchAndTranslate(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }
    const htmlContent = await response.text();
    // Call translation API (replace with actual API endpoint and method)
    const translatedContent = await translateContent(htmlContent);
    return translatedContent;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return null;
  }
}

async function translateContent(content) {
  // Replace with actual code to call translation API
  const translationResponse = await fetch('https://api.example.com/translate', {
    method: 'POST',
    body: JSON.stringify({ text: content }),
    headers: { 'Content-Type': 'application/json' }
  });
  if (!translationResponse.ok) {
    throw new Error(`Translation API failed: ${translationResponse.statusText}`);
  }
  const translatedData = await translationResponse.json();
  return translatedData.translatedText;  // Adjust according to API response structure
}

async function main() {
  try {
    const urls = JSON.parse(fs.readFileSync('urls.json', 'utf8'));
    for (const url of urls) {
      const translatedHtml = await fetchAndTranslate(url);
      if (translatedHtml) {
        // Generate HTML file
        fs.writeFileSync(`translated_${url}.html`, `<html><body>${translatedHtml}</body></html>`, 'utf8');
        console.log(`Generated translated_${url}.html`);
      }
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();

import fs from 'fs';

const filePath = 'C:/Users/shrut/.gemini/antigravity/brain/397c083a-edc3-4684-bfa9-1909d3e7bb24/.system_generated/steps/89/content.md';

try {
  const content = fs.readFileSync(filePath, 'utf8');
  console.log('File loaded successfully.');

  // Find all URLs
  const urlRegex = /https?:\/\/[^\s'`"()]+/g;
  const urls = content.match(urlRegex) || [];
  console.log('Found URLs:', Array.from(new Set(urls)));

  // Search around the Render URL
  const renderUrlIndex = content.indexOf('https://smart-invoice-gst-calculator.onrender.com/');
  if (renderUrlIndex !== -1) {
    console.log('Found Render URL at index:', renderUrlIndex);
    const context = content.substring(Math.max(0, renderUrlIndex - 150), renderUrlIndex + 150);
    console.log('Context around Render URL:\n', context);
  } else {
    console.log('Render URL not found.');
  }
} catch (error) {
  console.error('Error:', error);
}

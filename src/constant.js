const API_KEY = import.meta.env.VITE_API_KEY;

const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

export default url;
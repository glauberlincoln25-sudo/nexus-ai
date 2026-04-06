const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Proxy para Anthropic
app.post('/api/anthropic', async (req, res) => {
    try {
        const response = await axios.post('https://api.anthropic.com/v1/messages', req.body, {
            headers: {
                'x-api-key': req.headers['x-api-key'],
                'anthropic-version': '2023-06-01',
                'Content-Type': 'application/json'
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Erro Anthropic:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json(error.response?.data || {error: error.message});
    }
});

// Proxy para Gemini
app.post('/api/gemini', async (req, res) => {
    const apiKey = req.headers['x-goog-api-key'];
    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
            req.body,
            { headers: { 'Content-Type': 'application/json' } }
        );
        res.json(response.data);
    } catch (error) {
        console.error('Erro Gemini:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json(error.response?.data || {error: error.message});
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

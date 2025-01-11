const express = require('express');
const path = require('path');
const routes = require('./routes/index');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas API
app.use('/api', routes);

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/audio', express.static(path.join(__dirname, 'public/audio')));

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/index.html'));
});

// Mejorar el middleware de debugging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Manejo de errores mejorado
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    
    // Errores específicos
    if (err.code === 'ENOENT') {
        return res.status(404).json({ 
            error: 'Resource not found',
            details: err.message 
        });
    }

    // Error general
    res.status(500).json({ 
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log('API endpoints available at:');
    console.log(` - GET /api/current`);
    console.log(` - GET /api/next`);
    console.log(` - GET /api/previous`);
    console.log(` - GET /api/songs`);
});

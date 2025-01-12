const express = require('express');
const router = express.Router();
const audioController = require('../controllers/audioController');

// Define las rutas de la API y las conecta con sus respectivos controladores
router.get('/current', audioController.getCurrentSong);    // Obtiene la canción actual
router.get('/next', audioController.nextSong);            // Obtiene la siguiente canción
router.get('/previous', audioController.previousSong);     // Obtiene la canción anterior
router.get('/songs', audioController.getAllSongs);        // Obtiene toda la lista de canciones
router.get('/songs/:id', audioController.getSongDetails); // Obtiene detalles de una canción específica
router.post('/reload', audioController.reloadPlaylist);   // Recarga la lista de reproducción

module.exports = router;
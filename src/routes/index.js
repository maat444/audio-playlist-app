const express = require('express');
const router = express.Router();
const audioController = require('../controllers/audioController');

// Quitar el prefijo '/api' ya que ya lo agregamos en index.js
router.get('/current', audioController.getCurrentSong);
router.get('/next', audioController.nextSong);
router.get('/previous', audioController.previousSong);
router.get('/songs', audioController.getAllSongs);
router.get('/songs/:id', audioController.getSongDetails);
router.post('/reload', audioController.reloadPlaylist);

module.exports = router;
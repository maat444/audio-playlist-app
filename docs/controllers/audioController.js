const Playlist = require('../models/playlist');
const playlist = new Playlist();
const path = require('path');
const fs = require('fs');
const naturalSort = require('javascript-natural-sort');

const audioDir = path.join(__dirname, '../public/audio');

function sanitizeTitle(filename) {
    // Remover extensión y limpiar el nombre del archivo
    return filename
        .replace('.mp3', '')
        .replace(/_/g, ' ')
        .replace(/-/g, ' ')
        .replace(/^\d+\s*-?\s*/, ''); // Remover números del inicio
}

function loadAudioFiles() {
    try {
        // Crear directorio si no existe
        if (!fs.existsSync(audioDir)) {
            fs.mkdirSync(audioDir, { recursive: true });
            console.log('Created audio directory at:', audioDir);
        }

        // Leer archivos MP3
        const files = fs.readdirSync(audioDir)
            .filter(file => file.toLowerCase().endsWith('.mp3'))
            .sort(naturalSort);

        console.log(`Found ${files.length} MP3 files`);

        // Mapear archivos a objetos de canciones
        const songs = files.map((file, index) => {
            const stats = fs.statSync(path.join(audioDir, file));
            return {
                id: index + 1,
                title: sanitizeTitle(file),
                url: `/audio/${encodeURIComponent(file)}`,
                filename: file,
                size: stats.size,
                added: stats.mtime
            };
        });

        // Actualizar playlist
        playlist.clear();
        songs.forEach(song => playlist.addSong(song));
        
        console.log('Playlist updated with', songs.length, 'songs');
        return songs;

    } catch (error) {
        console.error('Error loading audio files:', error);
        return [];
    }
}

const audioController = {
    getCurrentSong: (req, res) => {
        const currentSong = playlist.getCurrentSong();
        res.json(currentSong || { error: 'No songs available' });
    },

    nextSong: (req, res) => {
        res.json(playlist.nextSong());
    },

    previousSong: (req, res) => {
        res.json(playlist.previousSong());
    },

    getAllSongs: (req, res) => {
        const songs = loadAudioFiles();
        console.log('Sending songs:', songs.length);
        res.json(songs);
    },

    reloadPlaylist: (req, res) => {
        const songs = loadAudioFiles();
        res.json({ 
            success: true, 
            count: songs.length,
            message: `Loaded ${songs.length} songs from ${audioDir}`
        });
    },

    getSongDetails: (req, res) => {
        const { id } = req.params;
        const song = playlist.songs.find(s => s.id === parseInt(id));
        if (song) {
            res.json(song);
        } else {
            res.status(404).json({ error: 'Song not found' });
        }
    }
};

// Vigilar cambios en el directorio de audio
fs.watch(audioDir, { persistent: true }, (eventType, filename) => {
    if (filename && filename.toLowerCase().endsWith('.mp3')) {
        console.log(`Detected ${eventType} in audio directory:`, filename);
        loadAudioFiles();
    }
});

// Carga inicial
loadAudioFiles();

module.exports = audioController;

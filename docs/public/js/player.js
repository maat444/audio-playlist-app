class AudioPlayer {
    constructor() {
        this.audio = new Audio();
        this.isPlaying = false;
        this.currentSong = null;
        this.playAll = false;
        this.autoplay = false;
        this.loadingPromise = null;
        this.customPlaylist = []; // Agregar inicialización de customPlaylist
        this.currentIndex = 0; // Agregar índice de canción actual
        this.songs = []; // Agregar array para almacenar todas las canciones
        this.customPlaylistIndex = 0;
        this.isPlayingCustom = false;
        
        // Inicialización en orden correcto
        this.setupAudioEvents();
        this.setupProgressBar();
        this.initializeButtons();
        this.loadCurrentSong();
        this.loadPlaylist(); // Aseguramos que se cargue la lista
        this.initializeCustomPlaylist();
    }

    updatePlayer(song) {
        if (song && song.url) {
            // Cancelar cualquier reproducción pendiente
            if (this.loadingPromise) {
                this.audio.pause();
                this.loadingPromise = null;
            }

            this.currentSong = song;
            this.audio.src = song.url;
            document.getElementById('currentSong').textContent = `Now playing: ${song.title}`;
            document.getElementById('playerStatus').textContent = 'Loading...';
            document.getElementById('progress').style.width = '0%';
            
            this.audio.addEventListener('canplay', () => {
                document.getElementById('playerStatus').textContent = 'Ready';
                if (this.isPlaying) {
                    this.togglePlay();
                }
            }, { once: true });

            // Actualizar las vistas para reflejar la canción actual
            this.updateSongsList(this.songs);
            this.updateCustomPlaylistView();
        }
    }

    initializeButtons() {
        document.getElementById('playBtn').addEventListener('click', () => this.togglePlay());
        document.getElementById('nextBtn').addEventListener('click', () => this.next());
        document.getElementById('prevBtn').addEventListener('click', () => this.previous());
        document.getElementById('playAllBtn').addEventListener('click', () => this.startPlayAll());
        document.getElementById('stopBtn').addEventListener('click', () => this.stopPlayback());
        document.getElementById('playCustomBtn').addEventListener('click', () => this.playCustomPlaylist());
        document.getElementById('clearCustomBtn').addEventListener('click', () => this.clearCustomPlaylist());
    }

    initializeCustomPlaylist() {
        this.updateCustomPlaylistView();
    }

    addToCustomPlaylist(song) {
        if (!this.customPlaylist.some(s => s.id === song.id)) {
            this.customPlaylist.push(song);
            this.updateCustomPlaylistView();
        }
    }

    removeFromCustomPlaylist(songId) {
        this.customPlaylist = this.customPlaylist.filter(song => song.id !== songId);
        this.updateCustomPlaylistView();
    }

    updateCustomPlaylistView() {
        const customPlaylistElement = document.getElementById('customPlaylist');
        if (!customPlaylistElement) return;

        customPlaylistElement.innerHTML = this.customPlaylist.map((song, index) => `
            <div class="playlist-item ${this.isPlayingCustom && this.currentSong && this.currentSong.id === song.id ? 'active' : ''}">
                <span onclick="player.playCustomSong(${index})">${song.title}</span>
                <button class="remove-from-playlist-btn" onclick="player.removeFromCustomPlaylist(${song.id})">
                    ❌ Remove
                </button>
            </div>
        `).join('');
    }

    startPlayAll() {
        this.playAll = true;
        this.autoplay = true;
        this.currentIndex = 0; // Comenzar desde la primera canción
        document.getElementById('playAllBtn').classList.add('active');
        
        if (this.songs.length > 0) {
            this.updatePlayer(this.songs[0]);
            this.audio.play();
        }
    }

    async loadAndPlayFirstSong() {
        try {
            const response = await fetch('/api/songs');
            const songs = await response.json();
            if (songs.length > 0) {
                this.updatePlayer(songs[0]);
                this.audio.play();
            }
        } catch (error) {
            console.error('Error starting playlist:', error);
        }
    }

    stopPlayback() {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.isPlaying = false;
        this.playAll = false;
        this.autoplay = false;
        this.isPlayingCustom = false;
        this.currentIndex = 0; // Resetear el índice
        this.customPlaylistIndex = 0;
        
        // Actualizar interfaz
        document.getElementById('playAllBtn').classList.remove('active');
        document.getElementById('playBtn').textContent = '▶ Play';
        document.getElementById('playCustomBtn').textContent = '▶ Play My Playlist';
        document.getElementById('playerStatus').textContent = 'Stopped';
        document.getElementById('progress').style.width = '0%';
    }

    async togglePlay() {
        try {
            if (this.audio.paused) {
                // Guardar la promesa de reproducción
                this.loadingPromise = this.audio.play();
                await this.loadingPromise;
                document.getElementById('playBtn').textContent = 'Pause';
            } else {
                await this.audio.pause();
                document.getElementById('playBtn').textContent = '▶ Play';
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Reproducción interrumpida - cargando nueva canción');
            } else {
                console.error('Error en reproducción:', error);
                this.stopPlayback();
            }
        }
    }

    setupAudioEvents() {
        this.audio.addEventListener('playing', () => {
            this.isPlaying = true;
            document.getElementById('playBtn').textContent = 'Pause';
            document.getElementById('playerStatus').textContent = 'Playing';
        });

        this.audio.addEventListener('pause', () => {
            this.isPlaying = false;
            document.getElementById('playBtn').textContent = 'Play';
            document.getElementById('playerStatus').textContent = 'Paused';
        });

        this.audio.addEventListener('ended', () => {
            if (this.isPlayingCustom) {
                // Reproducir siguiente canción de la lista personalizada
                this.customPlaylistIndex++;
                this.playCustomSong(this.customPlaylistIndex);
            } else if (this.playAll && this.autoplay) {
                this.currentIndex++;
                if (this.currentIndex >= this.songs.length) {
                    this.currentIndex = 0; // Volver al principio
                }
                
                if (this.songs[this.currentIndex]) {
                    this.updatePlayer(this.songs[this.currentIndex]);
                    this.audio.play().catch(error => {
                        console.error('Error playing next song:', error);
                    });
                }
            } else {
                this.stopPlayback();
            }
        });

        this.audio.addEventListener('error', (e) => {
            const error = e.target.error;
            let errorMessage = 'Error loading audio';
            
            if (error.code === error.MEDIA_ERR_NETWORK) {
                errorMessage = 'Network error - please check your connection';
            } else if (error.code === error.MEDIA_ERR_SRC_NOT_SUPPORTED) {
                errorMessage = 'Audio format not supported';
            }

            console.error('Audio error:', errorMessage);
            document.getElementById('playerStatus').textContent = 'Error';
            document.getElementById('currentSong').textContent = errorMessage;
        });
    }

    setupProgressBar() {
        this.audio.addEventListener('timeupdate', () => {
            const progress = (this.audio.currentTime / this.audio.duration) * 100;
            document.getElementById('progress').style.width = `${progress}%`;
        });
    }

    getCurrentSongIndex() {
        const playlistElement = document.getElementById('playlist');
        if (!playlistElement) return -1;
        
        const items = playlistElement.getElementsByClassName('playlist-item');
        for (let i = 0; i < items.length; i++) {
            if (items[i].classList.contains('active')) {
                return i;
            }
        }
        return -1;
    }

    getTotalSongs() {
        const playlistElement = document.getElementById('playlist');
        return playlistElement ? playlistElement.children.length : 0;
    }

    async loadCurrentSong() {
        try {
            const response = await fetch('/api/current');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const song = await response.json();
            if (song && song.url) {
                this.updatePlayer(song);
            } else {
                throw new Error('Invalid song data received');
            }
        } catch (error) {
            console.error('Error loading current song:', error);
            document.getElementById('playerStatus').textContent = 'Error';
            document.getElementById('currentSong').textContent = 'Error loading song';
        }
    }

    async fetchWithRetry(url, retries = 3) {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(url, {
                    signal: AbortSignal.timeout(5000)
                });
                if (response.ok) return response;
            } catch (error) {
                if (i === retries - 1) throw error;
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
        }
    }

    updateSongsList(songs) {
        const songsListElement = document.getElementById('songsList');
        if (!songsListElement) return;

        songsListElement.innerHTML = songs.map(song => `
            <div class="song-item ${this.currentSong && this.currentSong.id === song.id ? 'active' : ''}" 
                 data-song-id="${song.id}">
                <span class="song-title" onclick="player.playSong(${song.id - 1})">${song.title}</span>
                <button class="add-to-custom-btn" onclick="player.addToCustomPlaylist(${JSON.stringify(song).replace(/"/g, '&quot;')})">
                    Add to Playlist ➕
                </button>
            </div>
        `).join('');
    }

    async loadPlaylist() {
        try {
            const response = await fetch('/api/songs');
            if (!response.ok) throw new Error('Error loading songs');
            this.songs = await response.json(); // Guardar las canciones en la instancia
            
            this.updateSongsList(this.songs);
            this.updatePlaylist(this.songs);
            
            console.log('Loaded songs:', this.songs.length);
        } catch (error) {
            console.error('Error loading playlist:', error);
            document.getElementById('playerStatus').textContent = 'Error loading songs';
        }
    }

    updatePlaylist(songs) {
        const playlistElement = document.getElementById('playlist');
        if (!playlistElement) return;

        playlistElement.innerHTML = songs.map((song, index) => `
            <div class="playlist-item ${this.currentSong && this.currentSong.id === song.id ? 'active' : ''}">
                <span onclick="player.playSong(${index})">${song.title}</span>
                <button class="add-to-playlist-btn" onclick="player.addToCustomPlaylist(${JSON.stringify(song).replace(/"/g, '&quot;')})">
                    ➕ Add
                </button>
            </div>
        `).join('');
    }

    async playSong(index) {
        try {
            const response = await fetch('/api/songs');
            const songs = await response.json();
            if (songs[index]) {
                this.updatePlayer(songs[index]);
                this.audio.play();
            }
        } catch (error) {
            console.error('Error playing song:', error);
        }
    }

    async playCustomPlaylist() {
        if (this.customPlaylist.length === 0) {
            alert('Your playlist is empty! Add some songs first.');
            return;
        }

        // Resetear estados previos
        this.stopPlayback();
        
        // Activar modo de reproducción personalizada
        this.isPlayingCustom = true;
        this.customPlaylistIndex = 0;
        document.getElementById('playCustomBtn').textContent = '⏸ Pause My Playlist';
        
        // Iniciar reproducción de la primera canción
        await this.playCustomSong(this.customPlaylistIndex);
    }

    async playCustomSong(index) {
        if (index >= this.customPlaylist.length) {
            // Fin de la lista personalizada
            this.isPlayingCustom = false;
            this.stopPlayback();
            document.getElementById('playCustomBtn').textContent = '▶ Play My Playlist';
            return;
        }

        const song = this.customPlaylist[index];
        this.updatePlayer(song);
        try {
            await this.audio.play();
        } catch (error) {
            console.error('Error playing custom playlist song:', error);
            this.stopPlayback();
        }
    }

    clearCustomPlaylist() {
        this.customPlaylist = [];
        this.updateCustomPlaylistView();
        if (this.isPlayingCustom) {
            this.stopPlayback();
        }
    }
}

// Asegurarnos de que el DOM esté cargado antes de crear el player
document.addEventListener('DOMContentLoaded', () => {
    window.player = new AudioPlayer();
});
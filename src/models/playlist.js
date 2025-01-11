class Playlist {
    constructor() {
        this.songs = [];
        this.currentIndex = 0;
    }

    addSong(song) {
        this.songs.push(song);
    }

    nextSong() {
        if (this.currentIndex < this.songs.length - 1) {
            this.currentIndex++;
        }
        return this.songs[this.currentIndex];
    }

    previousSong() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
        }
        return this.songs[this.currentIndex];
    }

    getCurrentSong() {
        return this.songs[this.currentIndex];
    }

    clear() {
        this.songs = [];
        this.currentIndex = 0;
    }

    getTotalSongs() {
        return this.songs.length;
    }
}

module.exports = Playlist;
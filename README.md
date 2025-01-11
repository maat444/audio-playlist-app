# UniversoMaat444 Music Player

An interactive web-based audio player built with Node.js and Express.

## Features
- Play audio files from local storage
- Create custom playlists
- Continuous playback mode
- Responsive design
- Mobile-friendly interface

## Setup
1. Clone the repository
```bash
git clone https://github.com/[your-username]/audio-playlist-app.git
cd audio-playlist-app
```

2. Install dependencies
```bash
npm install
```

3. Add your MP3 files
- Place your MP3 files in `/src/public/audio/`

4. Start the server
```bash
npm start
```

5. Access the application
- Open `http://localhost:3000` in your browser

## Technologies
- Node.js
- Express
- HTML5 Audio API
- Vanilla JavaScript
- CSS3

## Author
- UniversoMaat444
- Contact: universomaat444@gmail.com

## License
This project is licensed under the MIT License.

## Estructura del Proyecto
```
audio-playlist-app/
├── src/
│   ├── controllers/
│   │   └── audioController.js
│   ├── models/
│   │   └── playlist.js
│   ├── routes/
│   │   └── index.js
│   ├── services/
│   │   └── audioService.js
│   ├── public/
│   │   ├── css/
│   │   │   └── styles.css
│   │   ├── js/
│   │   │   └── player.js
│   │   └── audio/
│   │       └── (archivos mp3)
│   └── views/
│       └── index.html
├── tests/
│   └── audio.test.js
├── package.json
├── .env
├── .gitignore
└── README.md
```

## Configuración
1. Instalar dependencias: `npm install`
2. Colocar archivos MP3 en: `src/public/audio/`
3. Iniciar servidor: `npm start`
4. Acceder a: `http://localhost:3000`
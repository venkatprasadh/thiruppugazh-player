// Collection of songs for the music player
const default_singer = 'Mrs. Meenakshi'; // Default artist name
const songs = [
  {
    id: 1,
    path: process.env.PUBLIC_URL + '/assets/media/songs/Kaithala_Niraikani.mp3',
    displayName: 'Kaithala Niraikani',
    cover: process.env.PUBLIC_URL + '/assets/media/album_cover/murugar.JPG',
    artist: default_singer,
    lyricsFile: process.env.PUBLIC_URL + '/assets/media/lyrics/Kaithala_Niraikani.lrc'
  },
  {
    id: 2,
    path: process.env.PUBLIC_URL + '/assets/media/songs/Umbartharu_Thenumani.mp3',
    displayName: 'Umbartharu Thenumani',
    cover: process.env.PUBLIC_URL + '/assets/media/album_cover/murugar.JPG',
    artist: default_singer,
    lyricsFile: process.env.PUBLIC_URL + '/assets/media/lyrics/Umbartharu_Thenumani.lrc'
  },
  {
    id: 3,
    path: process.env.PUBLIC_URL + '/assets/media/songs/Iravamal_Piravamal.mp3',
    displayName: 'Iravamal Piravamal',
    cover: process.env.PUBLIC_URL + '/assets/media/album_cover/murugar.JPG',
    artist: default_singer,
    lyricsFile: process.env.PUBLIC_URL + '/assets/media/lyrics/Iravamal_Piravamal.lrc'
  }
];

// Function to get all songs
export const getAllSongs = () => {
  return songs;
};

// Function to get a song by index
export const getSongByIndex = (index) => {
  if (index >= 0 && index < songs.length) {
    return songs[index];
  }
  return null;
};

// Function to get the total number of songs
export const getSongCount = () => {
  return songs.length;
};

// This will be expanded as we add more songs to the collection
// The structure allows for easy addition of new songs and metadata
export default {
  getAllSongs,
  getSongByIndex,
  getSongCount
};

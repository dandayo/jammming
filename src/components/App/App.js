import React, { useState, useEffect } from "react";
import "./App.css";

import Playlist from "../Playlist/Playlist";
import SearchBar from "../SearchBar/SearchBar";
import SearchResults from "../SearchResults/SearchResults";
import Spotify from "../../util/Spotify";
import PlaylistSelector from "../PlaylistSelector/PlaylistSelector";

const App = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [playlistName, setPlaylistName] = useState("New Playlist");
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [playlists, setPlaylists] = useState([]); 


// Метод для получения плейлистов
  const fetchPlaylists = () => {
    Spotify.getUserPlaylists()
      .then((fetchedPlaylists) => setPlaylists(fetchedPlaylists)) // Обновляем состояние
      .catch((error) => console.error("Error fetching playlists:", error));
  };

  // Вызов метода fetchPlaylists при загрузке компонента
  useEffect(() => {
    fetchPlaylists();
  }, []);

  // Проверка аутентификации
  const checkAuthentication = () => {
    const token = Spotify.getAccessToken();
    if (!token) {
      console.log("No token available.");
    } else {
      console.log("Token is available.");
    }
  };

  useEffect(() => {
    checkAuthentication();
  }, []);

  // Добавление трека в плейлист
  const addTrack = (track) => {
    if (playlistTracks.find((savedTrack) => savedTrack.id === track.id)) {
      return;
    }
    setPlaylistTracks([...playlistTracks, track]);
  };

  // Удаление трека из плейлиста
  const removeTrack = (track) => {
    setPlaylistTracks(playlistTracks.filter((savedTrack) => savedTrack.id !== track.id));
  };

  // Обновление имени плейлиста
  const updatePlaylistName = (name) => {
    setPlaylistName(name);
  };

  // Создание нового плейлиста
  const createNewPlaylist = () => {
    setSelectedPlaylistId(null);
    setPlaylistName("New Playlist");
    setPlaylistTracks([]);
  };

  // Выбор существующего плейлиста
  const handleSelectPlaylist = (playlistId) => {
    setSelectedPlaylistId(playlistId);
    Spotify.getPlaylist(playlistId)
      .then((playlist) => {
        setPlaylistName(playlist.name);
        setPlaylistTracks(playlist.tracks);
      })
      .catch((error) => console.error("Failed to load playlist:", error));
  };

  const savePlaylist = () => {
    setIsLoading(true);
    const trackUris = playlistTracks.map((track) => track.uri);
  
    if (selectedPlaylistId && trackUris.length === 0) {
      // Удаление пустого плейлиста
      Spotify.deletePlaylist(selectedPlaylistId)
        .then(() => {
          setPlaylistName("New Playlist");
          setPlaylistTracks([]);
          setSelectedPlaylistId(null);
          return Spotify.getUserPlaylists(); // Обновляем список плейлистов после удаления
        })
        .then((updatedPlaylists) => {
          setPlaylists(updatedPlaylists); // Обновляем плейлисты
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error deleting playlist:", error);
          setIsLoading(false);
        });
    } else if (selectedPlaylistId) {
      // Обновление существующего плейлиста
      Spotify.updatePlaylist(selectedPlaylistId, playlistName, trackUris)
        .then(() => Spotify.getUserPlaylists()) // После обновления получаем актуальный список
        .then((updatedPlaylists) => {
          setPlaylists(updatedPlaylists); // Обновляем плейлисты
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error updating playlist:", error);
          setIsLoading(false);
        });
    } else {
      // Создание нового плейлиста
      Spotify.savePlaylist(playlistName, trackUris)
        .then(() => Spotify.getUserPlaylists()) // Получаем актуальный список после сохранения
        .then((updatedPlaylists) => {
          setPlaylists(updatedPlaylists); // Обновляем плейлисты
          setPlaylistName("New Playlist");
          setPlaylistTracks([]);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error saving new playlist:", error);
          setIsLoading(false);
        });
    }
  };
  

  // Поиск треков
  const search = (term) => {
    Spotify.search(term).then((results) => setSearchResults(results));
  };

  return (
    <div>
      <h1>
        Ja<span className="highlight">mmm</span>ing
      </h1>
      <div className="App">
        <SearchBar onSearch={search} />
        <div className="PlaylistNameForm">
          <input
            type="text"
            onChange={(e) => updatePlaylistName(e.target.value)}
            placeholder="Enter playlist name"
          />
        </div>
        <div className="AppPlaylist">
          <SearchResults searchResults={searchResults} onAdd={addTrack} />
          <PlaylistSelector
            playlists={playlists}  // Передаем актуализированный список плейлистов
            onSelect={handleSelectPlaylist}
            selectedPlaylistId={selectedPlaylistId}
            onCreateNew={createNewPlaylist}
          />
          <Playlist
            playlistName={playlistName}
            playlistTracks={playlistTracks}
            onRemove={removeTrack}
            onSave={savePlaylist}
            buttonText={playlistTracks.length === 0 ? "Delete" : "Save to Spotify"}
          />
        </div>
      </div>
    </div>
  );
};

export default App;

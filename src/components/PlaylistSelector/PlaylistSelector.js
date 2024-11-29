import React, { useEffect } from "react";
import Spotify from "../../util/Spotify";
import "./PlaylistSelector.css";

const PlaylistSelector = ({ playlists, onSelect, selectedPlaylistId, onCreateNew }) => {
  // Удалили локальное состояние playlists, так как оно уже передается через props

  // Эффект для получения обновленных плейлистов после изменения плейлиста
  useEffect(() => {
    // В случае необходимости, можно обновить спискок при изменении selectedPlaylistId
    if (selectedPlaylistId) {
      Spotify.getUserPlaylists()
        .then((fetchedPlaylists) => {
          // Если нужно, можно сделать какие-то дополнительные действия с фетчингом данных
        })
        .catch((error) => console.error("Error fetching playlists:", error));
    }
  }, [selectedPlaylistId]);

  return (
    <div className="PlaylistSelector">
      <h2>Your Playlists</h2>
      <ul>
        {playlists && playlists.map((playlist) => (
          <li
            key={playlist.id}
            className="PlaylistSelectorItem"
            onClick={() => onSelect(playlist.id)}
            style={{ 
              fontWeight: playlist.id === selectedPlaylistId ? "bold" : "normal",
              color: playlist.id === selectedPlaylistId ? "#FFD700" : "inherit" 
            }}
          >
            {playlist.name}
          </li>
        ))}
      </ul>
      <h4>Or</h4>
      <button className="CreateNew" onClick={onCreateNew}>
        Create New Playlist
      </button>
    </div>
  );
};

export default PlaylistSelector;

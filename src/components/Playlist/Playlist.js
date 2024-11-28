import React from "react";
import TrackList from "../TrackList/TrackList";
import "./Playlist.css";

const Playlist = ({ playlistName, playlistTracks, onRemove, onSave }) => {
  return (
    <div className="Playlist">
      <h2>{playlistName}</h2>
      <TrackList tracks={playlistTracks} onRemove={onRemove} isRemoval={true} />
      <button className="Playlist-save" onClick={onSave}>
        SAVE TO SPOTIFY
      </button>
    </div>
  );
};

export default Playlist;

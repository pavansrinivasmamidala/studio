"use client";

import { useState, useRef } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const songList = [
  "Srivalli",
  "Oo Antava Oo Oo Antava",
  "Ramuloo Ramulaa",
  "Butta Bomma",
  "Inkem Inkem Inkem Kaavaale",
  "Samajavaragamana",
  "Vachinde",
];

export default function Home() {
  const [selectedSong, setSelectedSong] = useState("");
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlayPreview = (duration: number) => {
    if (selectedSong) {
      const songUrl = `/songs/${selectedSong.toLowerCase().replace(/ /g, "_")}.mp3`;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      audioRef.current = new Audio(songUrl);
      audioRef.current.play();
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
      }, duration * 1000);
    }
  };

  const handleSongSelect = (song: string) => {
    setSelectedSong(song);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-2xl font-bold mb-4">Telugu Tune Trivia</h1>

      <div className="mb-4">
        <Button onClick={() => handlePlayPreview(1)} className="mr-2 bg-accent text-accent-foreground">1 Sec</Button>
        <Button onClick={() => handlePlayPreview(3)} className="mr-2 bg-accent text-accent-foreground">3 Sec</Button>
        <Button onClick={() => handlePlayPreview(5)} className="mr-2 bg-accent text-accent-foreground">5 Sec</Button>
        <Button onClick={() => handlePlayPreview(15)} className="mr-2 bg-accent text-accent-foreground">15 Sec</Button>
        <Button onClick={() => handlePlayPreview(30)} className="bg-accent text-accent-foreground">30 Sec</Button>
      </div>

      <Select onValueChange={handleSongSelect}>
        <SelectTrigger className="w-[300px]">
          <SelectValue placeholder="Select a song" />
        </SelectTrigger>
        <SelectContent>
          {songList.map((song) => (
            <SelectItem key={song} value={song}>
              {song}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedSong && (
        <p className="mt-4">Selected song: {selectedSong}</p>
      )}

      <audio ref={audioRef} style={{ display: "none" }} />
    </div>
  );
}

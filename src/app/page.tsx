"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

const clientId = "bf485198b43d44629e2e761f9e456b15";
const redirectUri = "https://studio--telugu-tune-trivia.us-central1.hosted.app"; // Must match your Spotify app settings
const scopes = [
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "app-remote-control",
  "streaming",
  "playlist-modify-public",
  "playlist-modify-private",
  "user-library-read",
];

export default function Home() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [playingTrack, setPlayingTrack] = useState<any | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    if (code && !accessToken) {
      getAccessToken(code);
    } else if (!accessToken && localStorage.getItem("spotify_access_token")) {
      setAccessToken(localStorage.getItem("spotify_access_token"));
      fetchPlaylists(localStorage.getItem("spotify_access_token")!);
    }
  }, [accessToken]);

  const getAccessToken = async (code: string) => {
    try {
      const response = await fetch("/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code, redirectUri }),
      });

      if (response.ok) {
        const data = await response.json();
        setAccessToken(data.access_token);
        localStorage.setItem("spotify_access_token", data.access_token);
        fetchPlaylists(data.access_token);
        window.history.replaceState({}, document.title, "/");
      } else {
        console.error("Failed to get access token:", await response.text());
        toast({
          title: "Authentication Failed",
          description: "Could not connect to Spotify. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error getting access token:", error);
      toast({
        title: "Authentication Error",
        description: "An unexpected error occurred during authentication.",
        variant: "destructive",
      });
    }
  };

  const handleLogin = () => {
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${encodeURIComponent(scopes.join(" "))}`;
    window.location.href = authUrl;
  };

  const handleSearch = async () => {
    if (!accessToken || !searchQuery) return;
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.tracks.items);
      } else {
        console.error("Search failed:", await response.text());
        toast({
          title: "Search Failed",
          description: "Could not retrieve search results.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error during search:", error);
      toast({
        title: "Search Error",
        description: "An error occurred while searching.",
        variant: "destructive",
      });
    }
  };

  const fetchPlaylists = async (token: string) => {
    try {
      const response = await fetch("https://api.spotify.com/v1/me/playlists", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPlaylists(data.items);
      } else {
        console.error("Failed to fetch playlists:", await response.text());
      }
    } catch (error) {
      console.error("Error fetching playlists:", error);
    }
  };

  const handlePlayTrack = async (trackUri: string) => {
    if (!accessToken) return;
    try {
      await fetch("https://api.spotify.com/v1/me/player/play", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uris: [trackUri] }),
      });
      toast({
        title: "Playing Track",
        description: "Now playing on Spotify.",
      });
    } catch (error) {
      console.error("Error playing track:", error);
      toast({
        title: "Playback Error",
        description: "Could not play the selected track.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-3xl font-bold mb-6">Spotify Integration</h1>

      {!accessToken ? (
        <Button onClick={handleLogin} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          Connect to Spotify
        </Button>
      ) : (
        <div className="w-full max-w-3xl">
          <div className="flex mb-4">
            <Input
              type="text"
              placeholder="Search for a song..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mr-2"
            />
            <Button onClick={handleSearch}>Search</Button>
          </div>

          {searchResults.length > 0 && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Search Results</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Artist</TableHead>
                      <TableHead>Album</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {searchResults.map((track: any) => (
                      <TableRow key={track.id}>
                        <TableCell>{track.name}</TableCell>
                        <TableCell>{track.artists.map((artist: any) => artist.name).join(", ")}</TableCell>
                        <TableCell>{track.album.name}</TableCell>
                        <TableCell>
                          <Button onClick={() => handlePlayTrack(track.uri)} size="sm">
                            Play
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Playlist management and playback controls will be implemented here in future iterations */}
        </div>
      )}
    </div>
  );
}

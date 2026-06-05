const NodeHelper = require("node_helper");

module.exports = NodeHelper.create({

    start() {
        console.log("MMM-Lyrion helper started");

        this.coverCache = new Map();
        this.pendingRequests = new Map();

        this.CACHE_TTL = 1000 * 60 * 60 * 12; // 12h

        setInterval(() => {
            const now = Date.now();

            for (const [key, value] of this.coverCache.entries()) {
                if (value.expires < now) {
                    this.coverCache.delete(key);
                }
            }
        }, 60 * 60 * 1000);
    },

    socketNotificationReceived(notification, payload) {
        if (notification === "GET_PLAYERS_AND_TRACKS") {
            this.getPlayersAndTracks(payload);
        }
    },

    // ---------------------------
    // COVER RESOLVER
    // ---------------------------
    async resolveCover(track) {

        if (!track?.artist && !track?.title) return null;

        const key = `${track.artist}-${track.title}`.toLowerCase();
        const now = Date.now();

        const cached = this.coverCache.get(key);
        if (cached && cached.expires > now) {
            return cached.url;
        }

        if (this.pendingRequests.has(key)) {
            return this.pendingRequests.get(key);
        }

        const promise = (async () => {

            let cover = null;

            try {
                const mbRes = await fetch(
                    `https://musicbrainz.org/ws/2/recording/?query=artist:"${track.artist}" AND recording:"${track.title}"&fmt=json&limit=1`
                );

                const mbData = await mbRes.json();
                const releaseId = mbData?.recordings?.[0]?.releases?.[0]?.id;

                if (releaseId) {
                    cover = `https://coverartarchive.org/release/${releaseId}/front-500.jpg`;
                }

            } catch (e) {
                console.log("MusicBrainz error:", e.message);
            }

            if (!cover) {
                try {
                    const q = encodeURIComponent(`${track.artist} ${track.title}`);
                    const res = await fetch(`https://api.deezer.com/search?q=${q}`);
                    const data = await res.json();

                    cover = data?.data?.[0]?.album?.cover_big || null;

                } catch (e) {
                    console.log("Deezer error:", e.message);
                }
            }

            this.coverCache.set(key, {
                url: cover,
                expires: now + this.CACHE_TTL
            });

            this.pendingRequests.delete(key);

            return cover;

        })();

        this.pendingRequests.set(key, promise);
        return promise;
    },

    // ---------------------------
    // RPC
    // ---------------------------
    async rpcRequest(url, params) {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: 1,
                method: "slim.request",
                params
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        return response.json();
    },

    // ---------------------------
    // MAIN
    // ---------------------------
    async getPlayersAndTracks(lmsServer) {

        const url = `${lmsServer}/jsonrpc.js`;

        try {
            const playersData = await this.rpcRequest(url, [
                "-",
                ["players", 0, 99]
            ]);

            const players = playersData?.result?.players_loop || [];

            const playerDetails = await Promise.all(
                players.map(async (player) => {

                    try {
                        const statusData = await this.rpcRequest(url, [
                            player.playerid,
                            ["status", "-", 1, "tags:cgABbehldiqtyrSuoKLN"]
                        ]);

                        const status = statusData?.result || {};

                        const rawTrack = status?.playlist_loop?.[0];

                        console.log("=== RAW TRACK ===");
                        console.log(rawTrack);

                        let coverUrl = null;
                        if (rawTrack) {
                            coverUrl = await this.resolveCover(rawTrack);
                        }

                        // ---------------------------
                        // STREAM NAME 
                        // ---------------------------
                        const streamName = (() => {

                            if (!rawTrack) return player.name || "Webradio";

                            if (rawTrack.remote_title) return rawTrack.remote_title;

                            if (rawTrack.type) return rawTrack.type;

                            if (rawTrack.url) {
                                try {
                                    return new URL(rawTrack.url).hostname;
                                } catch {
                                    return player.name || "Webradio";
                                }
                            }

                            return player.name || "Webradio";
                        })();

                        // DIREKT AUS RAW TRACK
                        const artist = rawTrack?.artist || "";
                        const title = rawTrack?.title || "";

                        return {
                            name: player.name,
                            id: player.playerid,
                            isPlaying:
                                player.isplaying === 1 ||
                                player.isplaying === true ||
                                player.isplaying === "1",

                            track: rawTrack
                                ? {
                                    artist,
                                    title,
                                    album: rawTrack?.album || "",
                                    coverUrl,
                                    stream: streamName
                                }
                                : null
                        };

                    } catch (e) {
                        return {
                            name: player.name,
                            id: player.playerid,
                            isPlaying: false,
                            track: null
                        };
                    }
                })
            );

            this.sendSocketNotification("PLAYERS_TRACKS_RESULT", playerDetails);

        } catch (err) {
            console.error("LMS error:", err);
            this.sendSocketNotification("PLAYERS_TRACKS_RESULT", []);
        }
    }
});const NodeHelper = require("node_helper");

module.exports = NodeHelper.create({
    start() {
        console.log("MMM-Lyrion helper started");
    },

    socketNotificationReceived(notification, payload) {
        if (notification === "GET_PLAYERS_AND_TRACKS") {
            this.getPlayersAndTracks(payload);
        }
    },

    async rpcRequest(url, params) {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: 1,
                method: "slim.request",
                params
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }

        return response.json();
    },
    
    async getPlayersAndTracks(lmsServer) {
    const url = `${lmsServer}/jsonrpc.js`;

    try {
        // 1. Player holen
        const playersData = await this.rpcRequest(url, [
            "-",
            ["players", 0, 99]
        ]);

        const players = playersData?.result?.players_loop || [];

        // 2. Status pro Player (bleibt nötig für track)
        const playerDetails = await Promise.all(
            players.map(async (player) => {
                try {
                    const statusData = await this.rpcRequest(url, [
                        player.playerid,
                        ["status", "-", 1, "tags:cgABbehldiqtyrSuoKLN"]
                    ]);

                    const status = statusData?.result || {};
                    const track = status?.playlist_loop?.[0];

                    return {
                        name: player.name,
                        id: player.playerid,
                        isPlaying:
                            player.isplaying === 1 ||
                            player.isplaying === true ||
                            player.isplaying === "1",
                        track: track
                            ? {
                                  title: track.title || "",
                                  artist: track.artist || "",
                                  album: track.album || "",
                                  coverid: track.coverid || track.artwork_track_id || null  //cover holen
                              }
                            : null
                    };
                } catch (e) {
                    return {
                        name: player.name,
                        id: player.playerid,
                        isPlaying: false,
                        track: null
                    };
                }
            })
        );

        this.sendSocketNotification("PLAYERS_TRACKS_RESULT", playerDetails);
    } catch (err) {
        console.error("LMS error:", err);
        this.sendSocketNotification("PLAYERS_TRACKS_RESULT", []);
    }
}
    
    
});

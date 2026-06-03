const NodeHelper = require("node_helper");

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

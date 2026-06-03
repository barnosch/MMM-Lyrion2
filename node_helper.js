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
            throw new Error(
                `HTTP ${response.status} ${response.statusText}`
            );
        }

        return response.json();
    },

    async getPlayersAndTracks(lmsServer) {
        const url = `${lmsServer}/jsonrpc.js`;

        try {
            const playersData = await this.rpcRequest(url, [
                "-",
                ["players", 0, 99]
            ]);

            const players =
                playersData?.result?.players_loop ?? [];

            const playerDetails = await Promise.all(
                players.map(async (player) => {
                    try {
                        const statusData = await this.rpcRequest(url, [
                            player.playerid,
                            [
                                "status",
                                "-",
                                1,
                                "tags:cgABbehldiqtyrSuoKLN"
                            ]
                        ]);

                        const status =
                            statusData?.result ?? {};

                        const currentTrack =
                            status?.playlist_loop?.[0];

                        return {
                            name: player.name,
                            id: player.playerid,
                            isPlaying: player.isplaying === 1,
                            track: currentTrack
                                ? {
                                      title:
                                          currentTrack.title ?? "",
                                      artist:
                                          currentTrack.artist ?? ""
                                  }
                                : null
                        };
                    } catch (error) {
                        console.error(
                            `Failed to load status for player "${player.name}"`,
                            error
                        );

                        return {
                            name: player.name,
                            id: player.playerid,
                            isPlaying: player.isplaying === 1,
                            track: null
                        };
                    }
                })
            );

            this.sendSocketNotification(
                "PLAYERS_TRACKS_RESULT",
                playerDetails
            );
        } catch (error) {
            console.error(
                "Failed to load players from LMS:",
                error
            );

            this.sendSocketNotification(
                "PLAYERS_TRACKS_RESULT",
                []
            );
        }
    }
});
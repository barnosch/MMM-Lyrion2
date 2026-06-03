Module.register("MMM-Lyrion", {
    defaults: {
        updateInterval: 60000,
        lmsServer: "http://192.168.1.100:9000",
    },

    start() {
      this.players = [];
      this.getPlayers();

      this.updateTimer = setInterval(
          () => this.getPlayers(),
          this.config.updateInterval
      );
    },
    
    suspend() {
      if (this.updateTimer) {
          clearInterval(this.updateTimer);
          this.updateTimer = null;
      }
    },

    resume() {
      this.getPlayers();

      this.updateTimer = setInterval(
          () => this.getPlayers(),
          this.config.updateInterval
      );
    },
    
    getTranslations() {
      return {
        en: "translations/en.json",
        de: "translations/de.json",
      };
    },

    getPlayers() {
      this.sendSocketNotification("GET_PLAYERS_AND_TRACKS", this.config.lmsServer);
    },

    socketNotificationReceived(notification, payload) {
      if (notification === "PLAYERS_TRACKS_RESULT") {
          this.players = payload;
          this.updateDom(500);
      }
    },

    getStyles() {
      return ["MMM-Lyrion.css", "font-awesome.css"];
    },

    getDom() {
    const wrapper = document.createElement("div");
    wrapper.className = "Lyrion";

    // Nur Player anzeigen, die aktuell etwas abspielen
    const playingPlayers = this.players.filter(player => player.isPlaying && player.track);

    if (playingPlayers.length === 0) {
        //wrapper.innerHTML = this.translate("noplayer") + "  <i class='fa fa-music'></i>";  //old
        wrapper.textContent = this.translate("noplayer") + " ";
        const icon = document.createElement("i");
        icon.className = "fa fa-music";
        wrapper.appendChild(icon);
        
        return wrapper;
    }

    playingPlayers.forEach(player => {
        const playerDiv = document.createElement("div");
        playerDiv.className = "player-container";

        const header = document.createElement("div");
        header.className = "player-header";
        header.innerHTML = `<b>${player.name}</b>  <i class="fa fa-play"></i>`;
        playerDiv.appendChild(header);

        const trackInfo = document.createElement("div");
        trackInfo.className = "player-track-info";
        //trackInfo.innerHTML = `${player.track.artist} – ${player.track.title}`; //old
        trackInfo.textContent =
            `${player.track.artist} – ${player.track.title}`;

        playerDiv.appendChild(trackInfo);
        wrapper.appendChild(playerDiv);
    });

    return wrapper;

    }
});

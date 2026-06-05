Module.register("MMM-Lyrion2", {
    defaults: {
        updateInterval: 60000,
        lmsServer: "http://192.168.1.100:9000",
        showCovers: true    
    },

    start() {
        this.players = [];
        this.loaded = false;

        this.getPlayers();

        this.updateTimer = setInterval(() => {
            this.getPlayers();
        }, this.config.updateInterval);
    },

    suspend() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }
    },

    resume() {
        this.getPlayers();

        this.updateTimer = setInterval(() => {
            this.getPlayers();
        }, this.config.updateInterval);
    },

    getTranslations() {
        return {
            en: "translations/en.json",
            de: "translations/de.json"
        };
    },

    getPlayers() {
        this.sendSocketNotification(
            "GET_PLAYERS_AND_TRACKS",
            this.config.lmsServer
        );
    },

    socketNotificationReceived(notification, payload) {
        if (notification === "PLAYERS_TRACKS_RESULT") {
            this.players = payload || [];
            this.loaded = true;
            this.updateDom(300);
        }
    },

    getStyles() {
        return ["MMM-Lyrion.css", "font-awesome.css"];
    },

    getDom() {
        const wrapper = document.createElement("div");
        wrapper.className = "Lyrion";

        // 🔄 Loading State
        if (!this.loaded) {
            wrapper.textContent = "Loading Lyrion...";
            return wrapper;
        }

        // 🎧 nur aktive Player mit gültigem Track
        const playingPlayers = this.players.filter(
            p => p.isPlaying && p.track
        );

        // ❌ kein Player aktiv
        if (playingPlayers.length === 0) {
            wrapper.textContent = this.translate("noplayer") + " ";

            const icon = document.createElement("i");
            icon.className = "fa fa-music";
            wrapper.appendChild(icon);

            return wrapper;
        }

        // 🎵 Player rendern
        playingPlayers.forEach(player => {
           
          const playerDiv = document.createElement("div");
          playerDiv.className = "player-container";

          // LEFT (Cover)
          const left = document.createElement("div");
          left.className = "player-left";

          if (this.config.showCovers) {

              const coverWrapper = document.createElement("div");
              coverWrapper.className = "cover-wrapper";

              const img = document.createElement("img");
              img.className = "album-cover";

              if (player.track?.coverUrl) {
                  img.src = player.track.coverUrl;
                  coverWrapper.appendChild(img);
              } else {
                  coverWrapper.appendChild(this.createNoCoverIcon());
              }

              left.appendChild(coverWrapper);
          }

          // RIGHT (Text)
          const right = document.createElement("div");
          right.className = "player-right";
                    
          // Player Name
          const header = document.createElement("div");
          header.className = "player-header";

          // LEFT: Player Name + Icon
          const nameWrap = document.createElement("span");

          const name = document.createElement("b");
          name.textContent = player.name;

          const icon = document.createElement("i");
          icon.className = "fa fa-play";
          icon.style.marginLeft = "6px";

          nameWrap.appendChild(name);
          nameWrap.appendChild(icon);

          // RIGHT: Stream Name
          const stream = document.createElement("span");
          stream.className = "stream-inline";
          stream.textContent = player.track?.stream || "";

          // assemble
          header.appendChild(nameWrap);
          header.appendChild(stream);
          right.appendChild(header);
          
          // Track Info UNTER dem Header
          const trackInfo = document.createElement("div");
          trackInfo.className = "player-track-info";
          
          const artist = player.track?.artist || "";
          const title = player.track?.title || "";

          const text = (artist || title) ? `${artist} – ${title}` : "";

          if (text) {
              const span = document.createElement("span");
              span.textContent = text;
              trackInfo.appendChild(span);

              // nur scrollen wenn wirklich nötig
              setTimeout(() => {
                  if (span.scrollWidth > trackInfo.clientWidth) {
                      trackInfo.classList.add("marquee");
                  }
              }, 0);
          }

          //trackInfo.textContent = artist || title ? `${artist} – ${title}` : "";
          
          
          right.appendChild(trackInfo);

          // ZUSAMMENBAU
          playerDiv.appendChild(left);
          playerDiv.appendChild(right);

          wrapper.appendChild(playerDiv);
        });

        return wrapper;
    },
    
    createNoCoverIcon() {
    const icon = document.createElement("i");
    icon.className = "fa fa-music no-cover-icon";
    return icon;
}
});

Module.register("MMM-Lyrion2", {
    defaults: {
        updateInterval: 60000,
        lmsServer: "http://192.168.1.100:9000",
        showCovers: true
    },

    start() {
        this.players = [];
        this.loaded = false;

        this.getPlayers();

        this.updateTimer = setInterval(() => {
            this.getPlayers();
        }, this.config.updateInterval);
    },

    suspend() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }
    },

    resume() {
        this.getPlayers();

        this.updateTimer = setInterval(() => {
            this.getPlayers();
        }, this.config.updateInterval);
    },

    getTranslations() {
        return {
            en: "translations/en.json",
            de: "translations/de.json"
        };
    },

    getPlayers() {
        this.sendSocketNotification(
            "GET_PLAYERS_AND_TRACKS",
            this.config.lmsServer
        );
    },

    socketNotificationReceived(notification, payload) {
        if (notification === "PLAYERS_TRACKS_RESULT") {
            this.players = payload || [];
            this.loaded = true;
            this.updateDom(300);
        }
    },

    getStyles() {
        return ["MMM-Lyrion.css", "font-awesome.css"];
    },

    getDom() {
        const wrapper = document.createElement("div");
        wrapper.className = "Lyrion";

        // 🔄 Loading State
        if (!this.loaded) {
            wrapper.textContent = "Loading Lyrion...";
            return wrapper;
        }

        // 🎧 nur aktive Player
        const playingPlayers = this.players.filter(
            p => p.isPlaying && p.track
        );

        // ❌ kein Player aktiv
        if (playingPlayers.length === 0) {
            wrapper.textContent = this.translate("noplayer") + " ";

            const icon = document.createElement("i");
            icon.className = "fa fa-music";
            wrapper.appendChild(icon);

            return wrapper;
        }

        // 🎵 Player rendern
        playingPlayers.forEach(player => {
          const playerDiv = document.createElement("div");
          playerDiv.className = "player-container";

          // LEFT (Cover)
          const left = document.createElement("div");
          left.className = "player-left";

          if (this.config.showCovers) {
              const coverWrapper = document.createElement("div");
              coverWrapper.className = "cover-wrapper";

              if (player.track?.coverid) {
                  const img = document.createElement("img");

                  img.className = "album-cover";
                  img.src = `${this.config.lmsServer}/music/cover.jpg?id=${player.track.coverid}`;

                  img.onerror = () => {
                      coverWrapper.innerHTML = "";
                      coverWrapper.appendChild(this.createNoCoverIcon());
                  };

                  coverWrapper.appendChild(img);
              } else {
                  coverWrapper.appendChild(this.createNoCoverIcon());
              }

              left.appendChild(coverWrapper);
          }

          // RIGHT (Text)
          const right = document.createElement("div");
          right.className = "player-right";

          // Player Name
          const header = document.createElement("div");
          header.className = "player-header";
          header.innerHTML = `<b>${player.name}</b> <i class="fa fa-play"></i>`;

          // Track Info
          const trackInfo = document.createElement("div");
          trackInfo.className = "player-track-info";

          const artist = player.track.artist || "";
          const title = player.track.title || "";

          trackInfo.textContent = `${artist} – ${title}`;

          right.appendChild(header);
          right.appendChild(trackInfo);

          // ZUSAMMENBAU
          playerDiv.appendChild(left);
          playerDiv.appendChild(right);

          wrapper.appendChild(playerDiv);
        });

        return wrapper;
    },
    
    createNoCoverIcon() {
    const icon = document.createElement("i");
    icon.className = "fa fa-music no-cover-icon";
    return icon;
}
});


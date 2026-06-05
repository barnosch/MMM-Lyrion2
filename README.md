# MMM-Lyrion2
testing and optimizing

NEW* Cover support  
NEW* no Axios (additional package installed trough npm) needed anymore  

## Installation

Navigate to your MagicMirror modules directory and clone the repository:

```bash
cd ~/MagicMirror/modules
git clone https://github.com/barnosch/MMM-Lyrion2.git
```

## Configuration

To enable the module, add it to the config.js file in your MagicMirror setup:

```bash
{
    module: "MMM-Lyrion2",
    disabled: false,
    position: "bottom_right",                     // Adjust as needed
    config: {
        lmsServer: "http://10.30.10.11:9000",      // IPofyourserver:9000
        showCovers: true                          // true or false
    }

}
```

Playing\
<img width="360" height="217" alt="Lyrion2_cover" src="https://github.com/user-attachments/assets/3003d6ad-ad99-4570-a1bc-d273ebb92493" />
(synced players in this case)

Stopped\
![paused](https://github.com/user-attachments/assets/4d6792fe-e2d9-4fd4-8c8b-c4f87488b4ae)


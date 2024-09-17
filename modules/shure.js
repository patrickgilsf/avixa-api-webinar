import net from 'net';

class Shure {
  constructor({ ip = "" }) {
    this.ip = ip;
    this.mic = null;  // Store the socket connection here
  }

  __openConnection = async () => {
    // Check if the mic (TCP client) already exists and is connected
    if (this.mic && !this.mic.destroyed) {
      return this.mic; // Return the existing connection
    }

    return new Promise((resolve, reject) => {
      let mic = new net.Socket();
      mic.connect(2202, this.ip, () => {
        mic.setEncoding('utf8');
        mic.on('error', (err) => reject(err));
        mic.on('data', async (d) => {
          // Process incoming data here if necessary
          // console.log('Received data:', d);
        });
        this.mic = mic;
        resolve(mic);
      });

      mic.on('error', (err) => {
        console.log('Connection error:', err);
        this.mic = null; // Ensure the mic is reset if there was an error
        reject(err);
      });

      mic.on('close', () => {
        console.log('Connection closed');
        this.mic = null; // Reset the mic when the connection is closed
      });
    });
  };

  sendMute = async (state) => {
    let onOff = state ? "ON" : "OFF";
    await this.__openConnection()
      .then(() => {
        this.mic.write(`< SET DEVICE_AUDIO_MUTE ${onOff} >`);
      })
      .catch((err) => {
        console.error('Failed to send mute command:', err);
      });
  };

  sendCustomString = async (str) => {
    await this.__openConnection()
      .then(() => {
        this.mic.write(str);
      })
      .catch((err) => {
        console.error('Failed to send custom string:', err);
      });
  };

  closeConnection = () => {
    if (this.mic && !this.mic.destroyed) {
      this.mic.end(); // Gracefully close the connection
    }
  };
}

export default Shure;

// Example usage:
let shure = new Shure({ ip: "192.168.42.156" });
shure.sendMute(true); // Sending mute command

// Optionally, you can close the connection manually when done
// shure.closeConnection();

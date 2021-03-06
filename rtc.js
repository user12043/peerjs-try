const receiveText = document.querySelector("textarea#receiveText");
const sendText = document.querySelector("textarea#sendText");

let peer;
let dataConnection;
let mediaConnection;

const connect = () => {
  console.log(username.value);
  console.log(remoteUsername.value);

  const peerOptions = {
    debug: 3
  };

  if (serverAddress.value !== "") {
    peerOptions.host = serverAddress.value;
  }

  if (serverPort.value !== "") {
    peerOptions.port = serverPort.value;
  }

  if (serverKey.value !== "") {
    peerOptions.key = serverKey.value;
  }

  const config = {
    iceServers: [],
    sdpSemantics: "unified-plan"
  };

  if (stunServerAddress.value !== "") {
    if (!peerOptions.config) {
      peerOptions.config = config;
    }
    peerOptions.config.iceServers.push({
      urls: "stun:" + stunServerAddress.value
    });
  }

  if (turnServerAddress.value !== "") {
    if (!peerOptions.config) {
      peerOptions.config = config;
    }
    peerOptions.config.iceServers.push({
      urls: "turn:" + turnServerAddress.value
    });
  }

  peer = new Peer(username.value, peerOptions);

  peer.on("call", onCall);

  peer.on("disconnected", () => {
    header.innerText = "Disconnected";
  });

  peer.on("connection", onDataConnection);

  dataConnection = peer.connect(remoteUsername.value);

  dataConnection.on("open", function(connection) {
    console.log("Data connection OK");
  });

  dataConnection.on("data", onData);
};

// when receive a call
const onCall = async (mediaConnection) => {
  if (!localStream) {
    startSelf();
  }
  mediaConnection.answer(localStream);
  mediaConnection.on("stream", (stream) => {
    console.log("remote stream arrived");
    remoteVideo.srcObject = stream;
    selfVideo.srcObject = localStream;
  });
};

// remote data connection
const onDataConnection = async (dataConnection) => {
  dataConnection.on("data", onData);
};

const onData = (data) => {
  receiveText.append(data + "\n");
  console.log("Message received! ", data);
};

const call = async () => {
  if (!localStream) {
    startSelf();
  }
  mediaConnection = peer.call(remoteUsername.value, localStream);
  mediaConnection.on("stream", (stream) => {
    console.log("remote stream arrived");
    remoteVideo.srcObject = stream;
    selfVideo.srcObject = localStream;
  });
};

const hangup = () => {
  if (peer) {
    peer.destroy();
  }
  localStream.getTracks().forEach((t) => t.stop());
  localStream = null;
};

const send = () => {
  dataConnection.send(sendText.value);
  receiveText.append("-" + sendText.value + "\n");
  sendText.value = "";
};

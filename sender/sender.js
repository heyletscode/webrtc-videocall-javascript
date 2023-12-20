const webSocket = new WebSocket("ws://127.0.0.1:3000")

webSocket.onmessage = (event) => {
    handleSignallingData(JSON.parse(event.data))
}

function handleSignallingData(data) {
    switch (data.type) {
        case "answer":
            peerConn.setRemoteDescription(data.answer)
            break
        case "candidate":
            peerConn.addIceCandidate(data.candidate)
    }
}

let username
function sendUsername() {

    username = document.getElementById("username-input").value
    sendData({
        type: "store_user"
    })
}

function sendData(data) {
    console.log("sending username")
    data.username = username
    webSocket.send(JSON.stringify(data))
}


let localStream
let peerConn
function startCall() {
    document.getElementById("video-call-div")
    .style.display = "inline"

    navigator.getUserMedia({
        video: {
            frameRate: 24,
            width: {
                min: 480, ideal: 720, max: 1280
            },
            aspectRatio: 1.33333
        },
        audio: true
    }, (stream) => {
        localStream = stream
        document.getElementById("local-video").srcObject = localStream

        let configuration = {
            iceServers: [
                {
                    "urls": [
                      "stun:hk-turn1.xirsys.com"
                    ]
                  },
                  {
                    "username": "L4gfsy5vnVx_x2iGAyT4DJCo9RZk6z3UizVU1NLZJwsUWwfrD_ju2ZLVIrE3Ljf7AAAAAGWClQZ0aGVkcmhheDE0",
                    "credential": "d3c1c040-9f07-11ee-bf53-0242ac120004",
                    "urls": [
                      "turn:hk-turn1.xirsys.com:80?transport=udp",
                      "turn:hk-turn1.xirsys.com:3478?transport=udp",
                      "turn:hk-turn1.xirsys.com:80?transport=tcp",
                      "turn:hk-turn1.xirsys.com:3478?transport=tcp",
                      "turns:hk-turn1.xirsys.com:443?transport=tcp",
                      "turns:hk-turn1.xirsys.com:5349?transport=tcp"
                    ]
                  }
            ]
        }

        peerConn = new RTCPeerConnection(configuration)
        peerConn.addStream(localStream)

        peerConn.onaddstream = (e) => {
            document.getElementById("remote-video")
            .srcObject = e.stream
        }

        peerConn.onicecandidate = ((e) => {
            if (e.candidate == null)
                return
            sendData({
                type: "store_candidate",
                candidate: e.candidate
            })
        })

        createAndSendOffer()
    }, (error) => {
        console.log(error)
    })
}

function createAndSendOffer() {
    peerConn.createOffer((offer) => {
        sendData({
            type: "store_offer",
            offer: offer
        })

        peerConn.setLocalDescription(offer)
    }, (error) => {
        console.log(error)
    })
}

let isAudio = true
function muteAudio() {
    isAudio = !isAudio
    localStream.getAudioTracks()[0].enabled = isAudio
}

let isVideo = true
function muteVideo() {
    isVideo = !isVideo
    localStream.getVideoTracks()[0].enabled = isVideo
}

function leaveCall(){
    location.reload()
}
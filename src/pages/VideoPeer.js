import React, { Component } from "react";
import CallProgress from "../components/CallProgress";
import Header from "../components/Header";
import LowerThird from "../components/LowerThird";
import CanvasDraw from "../components/CanvasDraw";
import StatusBar from "../components/StatusBar";
import UserList from "../components/UserList";
import Peer from "peerjs";
import Chat from "../pages/Chat";
import { auth } from "../services/firebase";
import { db } from "../services/firebase";
import { usersRef } from "../services/firebase";
import { TinyYolov2SizeType } from "face-api.js";
import * as faceapi from 'face-api.js';

const MODEL_URL = '/models';

const HEARTBEAT = 5000;
const SYNC = 1000; // time to update user state for sharing
const CALLTIME = 90000;
const INSTRUCTIONS = "Click left video to find someone new, right video to stay longer.";

//name = user.displayName;
//email = user.email;
//photoUrl = user.photoURL;
//emailVerified = user.emailVerified;
//uid = user.uid;

const hdVideo = true;

/*
const hdVideo = {
  mandatory: {
    minWidth: 1280,
    minHeight: 720,
    maxWidth: 1280,
    maxHeight: 720
  }
};
*/

const PEER_SERVER_HOST = 'peer.scott.ai';
const PEER_SERVER_PORT = 443;

//const PEER_SERVER_HOST='localhost';
//const PEER_SERVER_PORT=9000;

class VideoPeer extends Component {

  constructor(props) {
    super(props);
    console.log("Calling videopeer constructor");
    this.initState();
    this.createRefs();
    this.bindHandlers();
  };

  initState() {
    this.state = {
      ai: false,
      pick: false,
      chatting: false,
      status: '',
      user: auth().currentUser,
      peer: false, id: false, error: false, conn: false
    };
    this.picking = false;
    this.clear = true;
  }


  async startAI() {
    if (this.state.ai === false) {
      console.log("loading AI...");
      await faceapi.loadSsdMobilenetv1Model(MODEL_URL);
      await faceapi.loadFaceLandmarkModel(MODEL_URL);
      await faceapi.loadFaceRecognitionModel(MODEL_URL);
      this.setState({ ai: true });
      console.log("AI models loaded");
    }
  };

  createRefs() {
    this.myRef = React.createRef();
    this.lower1 = React.createRef();
    this.lower2 = React.createRef();
    this.chat = React.createRef();
    this.statusBar = React.createRef();
  }

  bindHandlers() {
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleKeep = this.handleKeep.bind(this);
    this.handleLike = this.handleLike.bind(this);
    this.handleChatClose = this.handleChatClose.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.drawVideo = this.drawVideo.bind(this);
    this.vmirror = this.vmirror.bind(this);
    this.vcall = this.vcall.bind(this);
    this.handleChatOpen = this.handleChatOpen.bind(this);
    this.startAI = this.startAI.bind(this);
    this.serverSync = this.serverSync.bind(this);
  }

  connectToPeerServer() {
    var peer = new Peer({
      path: '/myapp',
      host: PEER_SERVER_HOST,
      port: PEER_SERVER_PORT,
      secure: false,
      debug: 3,
      secure: true,
      config: {
        'iceServers': [
          { url: 'stun:stun1.l.google.com:19302' },
          {
            url: 'turn:numb.viagenie.ca',
            credential: 'muazkh',
            username: 'webrtc@live.com'
          }
        ]
      }
    });
    console.log("created peer", peer);
    peer.on('error', (err) => {
      console.log("Heard my peer server disconnect!", err);
      this.setState({'peer': this.connectToPeerServer()});
    });
    return peer;
  };

  async componentWillUnmount() {
    console.log("Unmounting... stopping camera and feed");
    this.stopWebcam();
    this.stopVid();
    clearInterval(this.timer);
    try {
     var ref = db.ref("users/" + this.state.user.uid);
      ref.set("offline");
    } catch {
      console.log("Failed to log out");
    }
  };

  async componentDidMount() {
    const viewArea = this.myRef.current;
    const peer = this.connectToPeerServer();
    // we do this here as II need state.peer in other fns as we ramp up
    this.state.peer = peer;
    this.present();
    peer.on('open', id => {
      console.log('My peer ID is: ' + id);
      this.setState({ id });
      usersRef.doc(this.state.user.uid)
        .set({ 'peer': id }, { merge: true });
      this.startAI();
      this.vmirror();
    });
    this.vanswer();
    this.setState({ 'start': Date.now(), 
    'callStart': 0,
    'syncStart': 0, 
    'syncTime': 0,
    'time': 0, 
    'callTime': 0 });
    this.timer = setInterval(() => {
      var dt = Date.now() - this.state.start;
      this.setState({
        time: Date.now() - this.state.start,
        syncTime: Date.now() - this.state.syncStart,
        callTime: Date.now() - this.state.callStart
      })
    }, 50);
  };

  drawFace(ctx, box_id) {
    const box = this.state[box_id]
    if (box_id !== undefined && box !== undefined) {
      ctx.beginPath();
      ctx.strokeStyle = 'red';
      ctx.lineWidth = '4px'; 
      ctx.fillStyle = "red";
      ctx.fillRect(10,10,200,200);
      ctx.backgroundblendMode = 'normal';
     // ctx.fillRect(Math.round(box.left), Math.round(box.top), 
      //Math.round(box.width), Math.round(box.height));
     // ctx.fill();
      console.log("face box", Math.round(box.left), Math.round(box.top), 
      Math.round(box.width), Math.round(box.height));
      //ctx.stroke();
      ctx.closePath();
    }
  }

  faceHacker(canvas_id, box_id) {
    var canvas = document.getElementById(canvas_id);
    var box = this.state[box_id];
    if (box === false || box === undefined) return;

    if (canvas !== undefined) {
      if (canvas == null) {
        console.log("missing canvas!");
        return;
      }
      var ctx = canvas.getContext('2d');
      this.drawFace(ctx, box_id);
    }
  }

  componentDidUpdate() {
    this.videoHacker('canvas1', 'video1', 'face1');
    this.videoHacker('canvas2', 'video2', 'face2');
    if (this.state.ai !== 'busy') {
      //this.runAI();
    }
    //this.addLowerThirds();
    if (this.state.pick !== false) {
      console.log("change pick state");
      var pick = this.state.pick;
      this.setState({ 'pick': false });

      console.log("Calling ", pick.email);
      this.picking = false;
      this.vcall(pick);
    }
    if (this.state.time !== undefined) {
      if (this.state.time > HEARTBEAT) {
        this.heartbeat();
      }
      if (this.state.syncTime > SYNC) {
        this.serverSync();
      }
    }
  }

  peerHeartbeat() {
    var peer = this.state.peer;
    if (peer !== undefined && peer.socket._wsOpen()) {
      //console.log("ph");
      peer.socket.send({ type: 'HEARTBEAT' });
    }
  };

  cleanupDeadCalls() {
    var call = this.state.call;
    if (call !== undefined) {
      var pc = call.peerConnection.iceConnectionState;
      if (pc === 'disconnected') {
        this.stopVid();
        //this.clearCanvas('canvas2');
      }
      //console.log('Peer Connection is',pc);
    }
  }

  findMorePeople() {
    if (this.callProgress() >= 1) {
      this.pick();
    }
  }

  async runAI () {
    if (this.state.ai) {
      if (this.state.ai == 'busy') return;
      this.setState({'ai': 'busy'});
      const input = document.getElementById('canvas1');
      const detections = await faceapi.detectAllFaces(input);
      if (detections.length > 0) {
        //console.log("Faces",detections[0].box);
        this.setState({'face1': detections[0].box, 'ai': true});
      }
      else {
        this.setState({'face1': false, 'ai': true});
      }
    }
  }

  heartbeat() {
    // peerConnection iceConnectionState
    console.log("heartbeat");
    this.peerHeartbeat();
    this.cleanupDeadCalls();
    this.findMorePeople();
    this.setState({ 'start': Date.now(), 'time': 0 });
    //this.advanceCall();  
  };

  serverSync() {
    // peerConnection iceConnectionState
    let user = this.state.user;
    if (user !== undefined) {
      usersRef
        .doc(user.uid)
        .set({'progress': this.callProgress()},
             { merge: true });
      this.setState({ 'syncStart': Date.now(), 'syncTime': 0 });
    }
    //this.advanceCall();  
  };

  clearCanvas(canvas_id) {
    var canvas = document.getElementById(canvas_id);
    if (canvas !== null) {
      var cw = canvas.offsetWidth;
      var ch = canvas.offsetHeight;
      var ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, cw, ch);
    }
  };

  videoHacker(canvas_id, video_id, face_id) {
    var canvas = document.getElementById(canvas_id);
    var video = document.getElementById(video_id);

    if (canvas !== undefined && video !== undefined) {
      if (canvas == null) {
        console.log("missing canvas!");
        return;
      }
      var cw = canvas.width;
      var ch = canvas.height;
      var ctx = canvas.getContext('2d');
      if (video.srcObject === null) {
        // video is off, just clear screen
        if (video_id === 'video2' && !this.clear) {
          console.log("Clearing", cw, ch);
          ctx.beginPath();
          ctx.fillStyle = "green";
          ctx.fillRect(0, 0, cw, ch);
          ctx.closePath();
          this.clear = true;
        }
      }
      else {
        //console.log("video src", video.srcObject);
        //this.foo = undefined;
        var vw = video.videoWidth;
        var vh = video.videoHeight;
        var sx = 0, sy = 0, sw = 0, sh = 0
        var cs = (cw * 1.0) / (ch * 1.0 + 1);
        var vs = (vw * 1.0) / (vh * 1.0 + 1);
        if (vs > 1) {
          // wider video
          sw = vw;
          sh = vw * (1.0 / cs);
          if (sh > vh) {
            sh = vh;
            sw = vh * cs;
          }
        }
        else {
          // taller video
          sh = vh;
          sw = vh * cs;
          if (sw > vw) {
            sw = vw;
            sh = vw * (1.0 / cs);
          }
        }
        sx = (vw - sw) / 2;
        sy = 0; //(vh - sh) / 2;
        //console.log("video",vw,vh,"canvas",cw,ch,"end",w,h,"off",x0,y0);

        var w4 = cw * 1.0;
        var h4 = ch * 1.0;
        var x4 = (cw - w4) / 2.0;
        var y4 = (ch - h4) / 2.0;

        if (video_id === 'video2') {
          this.clear = false;
        }
        ctx.scale(-1, 1);
        ctx.imageSmoothingEnabled = false;
        // ctx.filter = 'blur(30px) opacity(95%)';
       // ctx.drawImage(video, sx, sy, sw, sh, 0, 0, -cw, ch);
       // ctx.restore();

        ctx.filter = 'blur(0px) opacity(100%)';
        ctx.drawImage(video, sx, sy, sw, sh, -x4, y4, -w4, h4);
        ctx.restore();

        //ctx.scale(1,1);
        //this.drawFace(ctx, face_id);

      }
    }
  };

  advanceCall() {
    console.log("Heard click to connect");
    if (this.callProgress() < 1) {
      this.setState({ 'callStart': 0 });
      console.log("Ending convo");
      this.status("Ending convo");
    }
    else {
      this.status("Looking for a new partner...");
      console.log("Finding new partner");
      this.pick();
    }
  }

  async handleSubmit(event) {
    event.preventDefault();
    //const viewArea = this.myRef.current;
    // redirect to chat
    this.advanceCall();
  };

  async handleKeep(event) {
    event.preventDefault();
    //const viewArea = this.myRef.current;
    // redirect to chat
    console.log("Heard click to keep");
    this.handleLike(null);
  };

  onSelect(peerId) {
    console.log("Peer window heard " + peerId);
    this.vcall(peerId);
  };

  pickAbove() {
    let val = Math.random();
    let me = this.state.peer.id;
    if (me === undefined) me = '';
    let picked = false;

    usersRef.where("random", ">=", val)
      .orderBy("random")
      .limit(2)
      .get()
      .then(snapshot => {
        if (snapshot.size > 0) {
          snapshot.forEach(doc => {
            var data = doc.data();
            if (data.peer !== me && !picked) {
              console.log("Found above ", data.email);
              this.status("Trying " + data.email);
              this.setState({ 'pick': data });
              picked = true;
            }
          });
          if (picked === false) this.pickBelow();
        }
        else {
          this.pickBelow();
        }
      });
  };

  pickBelow() {
    let val = Math.random();
    let me = this.state.peer.id;
    if (me === undefined) me = '';
    var picked = false;

    usersRef.where("random", "<=", val)
      .orderBy("random", "desc")
      .limit(2)
      .get()
      .then(snapshot => {
        if (snapshot.size > 0) {
          snapshot.forEach(doc => {
            var data = doc.data();
            if (data.peer !== me && !picked) {
              console.log("Found below ", data.email);
              this.status("Trying " + data.email);
              this.setState({ 'pick': data });
              picked = true;
            }
          });
        }
      });
    if (picked === false) {
      console.log("Nobody around");
      this.status("Everyone's busy.  Try again.");
    }
    this.picking = false;
  };

  pick() {
    if (this.picking === false) {
      this.picking = true;
      this.setState({ 'callStart': 0 }); // we're ready to switch!
      this.stopVid();
      this.pickAbove();
    }
  };

  present() {
    let user = this.state.user;
    let peerid = this.state.peer.id;
    if (peerid === undefined) peerid = false;
    usersRef
      .doc(user.uid)
      .set({
        progress: 0,
        random: Math.random(),
        uid: user.uid,
        online: true,
        peer: peerid,
        name: user.displayName,
        pic: user.photoURL,
        email: user.email
      }, { merge: true });
    var ref = db.ref("users/" + user.uid);
    ref.onDisconnect().set("offline"); //not working?
    ref.set("online");
    console.log(user.displayName + " now videochatting");
    console.log("lowerRef1", this.lowerRef1);
    this.setState({
      'email1': user.email, 
      'pic1': user.photoURL,
      'uid1': user.uid,
      'displayName1': user.displayName
    });
  }

  stopVid() {
    console.log("Stopping vid", this.state.remote);
    if (this.state.remote !== undefined) {

      var call = this.state.call;
      var ctrl = this.state.ctrl;
      if (call !== undefined) {
        console.log("...closing active call", ctrl);
        if (ctrl !== undefined) ctrl.send('close');
        console.log(call);
        call.close();
      }
      var video = document.getElementById('video2');
      if (video !== undefined) {
        console.log("..ditching video source");
        video.srcObject = null;
        this.lower2.current.setInfo("", '');
      }

      console.log("...turning off (remote) cam");
      if (this.state.remote !== undefined) {
        this.state.remote.getVideoTracks()[0].stop();
      }
      console.log("Closing chat window");
      this.chat.current.setVisible(false);

      this.setState({
        'chatting': false,
        'remote': undefined, 
        'call': undefined, 
        'pic2': undefined, 
        'uid2': undefined,
        'email2': undefined, 
        'displayName2': undefined,
        'callStart': Date.now() - (CALLTIME - 2000) // give us 2 seconds to adjust
      });
    }
    //this.clearCanvas('canvas2');
  }

  stopWebcam() {
    console.log("Stopping webcam", this.state.webcam);
    if (this.state.webcam !== undefined) {
      var video = document.getElementById('video1');
      if (video !== undefined) video.srcObject = null;
      this.state.webcam.getTracks()[0].stop();
      this.setState({ 'webcam': undefined });
    }
  }

  handleCtrl(data) {
    console.log("Heard data", data);
    if (data === 'close') {
      var ctrl = this.state.ctrl;
      if (ctrl !== undefined) {
        this.state.ctrl.close();
      }
      this.setState({ 'ctrl': undefined });
      this.stopVid();
      this.status("Closing chat");
    }
    else if (data == 'like') {
      // trigger a heart animation, record for later
      console.log("They like you!");
      this.status("They like you!");
    }
  }


  vcall(destUser) {
    var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    var peer = this.state.peer;
    var video = document.getElementById('video2');
    this.stopVid();

    getUserMedia({ video: hdVideo, audio: true }, stream => {
      var call = peer.call(destUser.peer, stream);
      call.on('stream', remoteStream => {
        // Show stream in some video/canvas element.
        this.updateCallerId(call);
        this.setState({
          'remote': remoteStream, 
          'call': call,
          'callStart': Date.now(),
          'uid2': destUser.uid,
          'email2': destUser.email, 
          'displayName2': destUser.name,
          'pic2': destUser.pic
        });
        video.srcObject = remoteStream;
        video.onloadedmetadata = function (e) {
          console.log("Playing video");
          video.play();
        };
      });
      var ctrl = peer.connect(destUser.peer);
      ctrl.on('open', () => {
        ctrl.on('data', (data) => {
          this.handleCtrl(data);
        });
        ctrl.on('close', () => {
          this.handleCtrl('close');
        });
        this.setState({ 'ctrl': ctrl });
      });

      call.on('close', s => {
        this.status("Video call ended");
        console.log("Call disconnected");
        this.stopVid();
      });
    }, function (err) {
      this.status("Video call failed");
      console.log('Failed to make video call', err);
    });
  };

  vmirror() {
    var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    getUserMedia({
      video: hdVideo, audio: false,
    }, stream => {
      var video = document.getElementById('video1');
      this.setState({ 'webcam': stream });
      console.log("Mirror", this.state);
      this.lower1.current.setInfo(this.state.displayName1, this.state.email1, this.state.pic1);
      video.srcObject = stream;
      video.onloadedmetadata = function (e) {
        console.log("Playing webcam", stream);
        video.play();
      };
    });
  };

  updateCallerId(call) {
    var peerId = call.peer;
    console.log("Searching for peer", peerId);
    usersRef.where("peer", "==", peerId)
      .get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          var data = doc.data();
          const displayName2 = data.name;
          const email2 = data.email;
          const pic2 = data.pic;
          const uid2 = data.uid;
          this.setState({ displayName2, email2, pic2, uid2});
          this.chat.current.setChat(this.state.uid1, uid2);
          this.lower2.current.setInfo(displayName2, email2, pic2);
          this.status("Connecting to " + String(displayName2));
          //console.log("Connecting to ",displayName2, email2);
        });
      });
  };

  notReady() {
    return (this.state.callTime < CALLTIME);
  };

  callProgress() {
    return Math.min(1.0, this.state.callTime / (1.0 * CALLTIME));
  };

  status(text) {
    //console.log("status bar",this.statusBar.current);
    if (this.statusBar.current !== null) {
      this.statusBar.current.status(text);
    }
    this.setState({ 'status': text });
  };

  _onMouseMove(e) {
    if (this.state.status !== INSTRUCTIONS) {
      this.status(INSTRUCTIONS);
    }
    this.setState({ x: e.screenX, y: e.screenY });
  }

  answerCall(call) {
    var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    var video = document.getElementById('video2');
    getUserMedia({ video: hdVideo, audio: true }, stream => {
      call.answer(stream); // Answer the call with an A/V stream.
      call.on('stream',
        remoteStream => {
          // Show stream in some video/canvas element.
          this.status("Someone's connecting...");
          this.updateCallerId(call);
          video.srcObject = remoteStream;
          this.setState({ 'remote': remoteStream, 
          'call': call, 
          'callStart': Date.now() });
          video.onloadedmetadata = function (e) {
            console.log("Playing video");
            video.play();
          };
        },
        function (err) {
          this.status("Failed to answer video call.");
          console.log('Failed to answer video call', err);
        });
    });
  };

  vanswerVideo() {
    this.state.peer.on('call', call => {
      console.log("Got call", call);
      this.status("Someone is calling you");
      if (this.notReady()) {
        console.log("...rejecting");
        call.close();
      }
      else {
        this.stopVid(); // be smarter based on delay
        this.answerCall(call);
      }
    });
  };

  vanswerCtrl() {
    this.state.peer.on('connection', conn => {
      if (this.notReady()) {
        console.log("Rejecting data connection", this.callProgress());
        conn.close();
      }
      else {
        console.log("Inbound data connection");
        var ctrl = this.state.ctrl;
        if (ctrl !== undefined) {
          console.log("...closing current data");
          ctrl.send('close');
          //ctrl.close();
        }
        this.setState({ 'ctrl': conn });
        conn.on('open', () => {
          conn.on('data', data => {
            this.handleCtrl(data);
          });
          conn.send('ack');
        });
      }
    });
  };

  vanswer() {
    this.vanswerVideo();
    this.vanswerCtrl();
  }

  drawVideo(ctx) {
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(0, 0, 150, 75);
  };

  handleChatClose(who) {
    console.log("Heard chat close",who);
    this.setState({'chatting': false});
  }

  handleChatOpen(who) {
    console.log("Heard chat open",who);
    const newChatState = !this.state.chatting;
    if (newChatState) {
      this.chat.current.setChat(this.state.uid1, this.state.uid2);
      this.chat.current.setVisible(true);
      this.setState({'chatting': newChatState});
    }
    else {
      this.chat.current.setVisible(false);
      this.chat.current.handleClose();
    }
  }


  handleLike(who) {
    this.setState({
      'callStart': Date.now()
    });
    this.status("You like them!  Adding another 30 seconds");
    if (this.state.ctrl != undefined) {
      this.state.ctrl.send('like');
    }
  }

  render() {
    var selector = this.onSelect;
    //console.log("Render "+this.state.status);
    var showLeft = (this.state.chatting === false);
    return (
      <div onMouseMove={this._onMouseMove.bind(this)} className="all">
        <Header />
        <CallProgress progress={this.callProgress()} />
        <div id="video">
          <div id="leftVideo">
            <Chat onClose={this.handleChatClose} ref={this.chat}/>
            <CanvasDraw visible={showLeft} id='canvas1' onClick={this.handleSubmit}/>
          </div>
          <div id="rightVideo">
            <CanvasDraw id='canvas2' onClick={this.handleKeep} />
          </div>
        </div>
        <div id="lowerThird">
          <LowerThird id="lower1" onChat={this.handleChatOpen} ref={this.lower1} />
          <LowerThird id="lower2" onLike={this.handleLike} ref={this.lower2} />
        </div>
        <StatusBar id="status" ref={this.statusBar} />
        <video id='video1' className="PeerArea">
        </video>
        <video id='video2' className="PeerArea">
        </video>
      </div>
    );
  };

};

export default VideoPeer;
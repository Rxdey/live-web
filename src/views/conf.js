const option = {
  iceServers: [
    { url: 'turn:45.76.203.52:3478', username: 'rxdey', credential: '814919' },
    { url: 'stun:45.76.203.52:3478', username: 'rxdey', credential: '814919' },
    { url: 'stun:stun.l.google.com:19302' }
  ],
  sdpSemantics: 'plan-b'
  // sdpSemantics: 'unified-plan'
};
export default option;

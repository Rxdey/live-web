const option = {
  iceServers: [
    { url: 'stun:stun.l.google.com:19302' },
    { url: 'stun:stun2.l.google.com:19302' },
    { url: 'stun:stun.schlund.de' }
  ],
  // sdpSemantics: 'plan-b'
  sdpSemantics: 'unified-plan'
};
export default option;

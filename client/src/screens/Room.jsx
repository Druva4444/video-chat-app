import React, { useEffect, useRef, useState } from 'react';
import { useSocket } from '../context/socketprovider';
import { usePeer } from '../context/peer';

export default function Room() {
  const [isConnected, setIsConnected] = useState(false);
  const [stream, setStream] = useState(null);
  const [remoteEmail, setRemoteEmail] = useState('');
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const socket = useSocket();
  const { peer, createoffer, createanswer, setanswer, sendstream, remotestream } = usePeer();

  // Handle remote stream video
  useEffect(() => {
    if (remoteVideoRef.current && remotestream) {
      remoteVideoRef.current.srcObject = remotestream;
    }
  }, [remotestream]);

  // Handle local stream video
  useEffect(() => {
    if (localVideoRef.current && stream) {
      localVideoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Get local media stream
  useEffect(() => {
    async function getUserMedia() {
      try {
        const userStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setStream(userStream);
        sendstream(userStream); // auto-send stream once ready
      } catch (error) {
        console.error('Error accessing media devices:', error);
      }
    }

    getUserMedia();
  }, []);

  // Socket event handlers
  useEffect(() => {
    async function handleUserJoined(data) {
      setIsConnected(true);
      const { email } = data;
      console.log('Another user joined:', data);

      try {
        const offer = await createoffer();
        socket.emit('call-user', { email, offer });
        setRemoteEmail(email);
      } catch (err) {
        console.error('Error creating or sending offer:', err);
      }
    }

    async function handleIncomingCall(data) {
      const { from, offer } = data;
      console.log('Incoming call from:', from);

      try {
        const ans = await createanswer(offer);
        socket.emit('accepted', { email: from, ans });
        setRemoteEmail(from);
      } catch (err) {
        console.error('Error handling incoming call:', err);
      }
    }

    async function handleAccept(data) {
      const { ans, email } = data;
      console.log('Received answer from:', email);

      try {
        if (peer.signalingState === 'have-local-offer') {
          await setanswer(ans);
          setRemoteEmail(email);
        } else {
          console.warn('Skipped setting remote answer due to incorrect signaling state:', peer.signalingState);
        }
      } catch (err) {
        console.error('Error setting remote answer:', err);
      }
    }

    socket.on('user_joined', handleUserJoined);
    socket.on('incoming-call', handleIncomingCall);
    socket.on('call_accepted', handleAccept);

    return () => {
      socket.off('user_joined', handleUserJoined);
      socket.off('incoming-call', handleIncomingCall);
      socket.off('call_accepted', handleAccept);
    };
  }, [createoffer, socket, createanswer, setanswer, peer]);

  // Handle negotiationneeded event
  useEffect(() => {
    const handleNegotiation = async () => {
      try {
        const localOffer = await peer.createOffer();
        await peer.setLocalDescription(localOffer);
        socket.emit('call-user', { email: remoteEmail, offer: localOffer });
      } catch (err) {
        console.error('Negotiation error:', err);
      }
    };

    peer.addEventListener('negotiationneeded', handleNegotiation);
    return () => peer.removeEventListener('negotiationneeded', handleNegotiation);
  }, [peer, socket, remoteEmail]);

  return (
    <div>
      <h2>Room</h2>
      <p>{isConnected ? 'Connected' : 'Not connected'}</p>
      <h4>You are connected to: {remoteEmail || 'Waiting...'}</h4>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <div>
          <h5>Your Video</h5>
          <video ref={localVideoRef} autoPlay muted playsInline style={{ width: '300px', border: '1px solid black' }} />
        </div>
        <div>
          <h5>Remote Video</h5>
          <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '300px', border: '1px solid black' }} />
        </div>
      </div>
    </div>
  );
}

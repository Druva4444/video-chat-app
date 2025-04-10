import { useContext, createContext, useMemo,useState, useEffect,useRef } from "react";

const PeerContext = createContext(null);

export const usePeer = () => useContext(PeerContext);

export const Provider = (props) => {
    const tracksAddedRef = useRef(false); // <- new
    const [remotestream,setremotestream] = useState(null)
    const peer = useMemo(() => new RTCPeerConnection({
        iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:global.stun.twilio.com:3478" },
        ],
    }), []);

    const createoffer = async () => {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        return offer;
    };
    const createanswer = async (offer)=>{
        await peer.setRemoteDescription(offer);
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        return answer
    }
    const setanswer = async (ans)=>{
        await peer.setRemoteDescription(ans)
    }
    const sendstream = async (stream) => {
        if (tracksAddedRef.current) return; // prevent duplicate
        tracksAddedRef.current = true;
        stream.getTracks().forEach((track) => {
            peer.addTrack(track, stream);
        });
    };
    useEffect(()=>{
        peer.addEventListener('track',(event)=>{
            const remoteStream = event.streams[0];
            setremotestream(remoteStream);
        }
       
    )
    
    
    },[peer])
    return (
        <PeerContext.Provider value={{ peer, createoffer,createanswer,setanswer ,sendstream,remotestream}}>
            {props.children}
        </PeerContext.Provider>
    );
};

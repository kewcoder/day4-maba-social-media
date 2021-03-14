import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";



const StyledVideo = styled.video`
        width:50px;
        height50px;
        background:black;
        margin:10px
`;

const Video = (props) => {
    const ref = useRef();

    // console.log(ref.current)

    useEffect(() => {
            props.peer.on("stream", stream => {
                ref.current.srcObject = stream;
            })
        

    }, [props]);

        return (
            <div>
                <StyledVideo playsInline autoPlay ref={ref} />
            </div>
        );
}

const Room = (props) => {
    // const [joined, setJoined] = useState(false);

    const [peers, setPeers] = useState([]);
    const [roomData, setRoomData] = useState([]);

    const socketRef = useRef();
    const userVideo = useRef();
    const peersRef = useRef([]);
    const roomID = props.match.params.roomID;


    useEffect(() => {    

           const login = JSON.parse(localStorage.getItem('login'))
        
            socketRef.current = io.connect("/");

            
            navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
                userVideo.current.srcObject = stream;
                
                let joinData = {
                    name: 'Nama Room',
                    code: socketRef.current.id,
                    roomID: roomID,
                    moderator: login,
                    speakers: {
                        slot: '',
                        id: socketRef.current.id
                    },
                    slot: 8
                }
                socketRef.current.emit("join room", joinData);

                socketRef.current.on("room data", data => {
                    setRoomData(data)
                })

                socketRef.current.on("user leave", data => {
                    console.log(data)
                })

                socketRef.current.on("all users", users => {
                    const peers = [];
                    users.forEach(userID => {
                        const peer = createPeer(userID, socketRef.current.id, stream);
                        peersRef.current.push({
                            peerID: userID,
                            peer,
                        })
                        peers.push(peer);
                    })
                    setPeers(peers);
                })

                socketRef.current.on("user joined", payload => {
                    
                    console.log(payload)

                    const peer = addPeer(payload.signal, payload.callerID, stream);
                    peersRef.current.push({
                        peerID: payload.callerID,
                        peer,
                    })

                    setPeers(users => [...users, peer]);
                });

                socketRef.current.on("receiving returned signal", payload => {
                    const item = peersRef.current.find(p => p.peerID === payload.id);
                    item.peer.signal(payload.signal);
                });

            })


        
    }, [roomID,props]);

    function createPeer(userToSignal, callerID, stream) {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream,
        });

        peer.on("signal", signal => {
            socketRef.current.emit("sending signal", { userToSignal, callerID, signal })
        })

        return peer;
    }

    function addPeer(incomingSignal, callerID, stream) {
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
        })

        peer.on("signal", signal => {
            socketRef.current.emit("returning signal", { signal, callerID })
        })

        peer.signal(incomingSignal);

        return peer;
    }

    return (
        <div className="main">
           <div className="left">
                <div className="content">
                Me: <StyledVideo muted ref={userVideo} autoPlay playsInline />

                <br />
                Other: 
                    {peers.map((peer, index) => {
                        return (
                            <Video key={index} peer={peer} />
                        );
                    })}
                </div>
           </div>
           <div className="right">
               <div className="content">
                    Right
                    { JSON.stringify(roomData) }
               </div>
           </div>
        </div>
    );
};

export default Room;

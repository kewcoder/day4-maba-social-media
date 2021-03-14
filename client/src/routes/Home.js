
import React, {  useRef } from "react";
import io from "socket.io-client";
import { v1 as uuid } from "uuid";

const Home = (props) => {
    function create() {
        const id = uuid();
        props.history.push(`/room/${id}/aribahtiar`);
    }

    const socketRef = useRef();
    socketRef.current = io.connect("/");
    socketRef.current.emit("find room");
    socketRef.current.on("all rooms", rooms => {
        console.log(rooms)
    })

    return (
        <div className="main">
            <div className="left">
                <div className="content">
                    Left
                </div>
            </div>
            <div className="right">
                <div className="content">
                  Right
                </div>
            </div>
            <button onClick={create}>Create room</button>
        </div>
    );
};

export default Home;

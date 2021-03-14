
import React, {  useRef,useEffect, useState } from "react";
import io from "socket.io-client";
import { v1 as uuid } from "uuid";

const Home = (props) => {
    

    const [login, setLogin] = useState('');
    const [rooms, setRooms] = useState([]);
    
    const socketRef = useRef();

    let loginState = {};

    useEffect(() => {
      
        socketRef.current = io.connect("/");

        socketRef.current.emit("find room");
        socketRef.current.on("all rooms", data => {
            setRooms(data)
        })
        
        // Default
        let loginData = {
            name: 'Ari Bahtiar',
            major: 'Informatika',
            year: 2021,
            gender: 1
        }

        setLogin(loginData)

        localStorage.setItem('login',JSON.stringify(loginData))


    }, []);

    function create() {
        const id = uuid();
        props.history.push(`/room/${id}`);
    }

    function joinRoom(id) {
        props.history.push(`/room/${id}`);
    }

    

    function updateLogin(){
        setLogin({
            name: 'Ari Bahtiar',
            major: 'Informatika',
            year: 2021,
            gender: 1
        })
    }

    function showRoom(){
        return rooms.map(room => {
            return <div className="item" key={room.code} onClick={ () => joinRoom(room.roomID)}>
                <h4>{ room.name }</h4>
                <span>{ room.length } User | Room Code </span>
                <span>{ room.code }</span>
            </div>
        })
    }
    return (
        <div className="main">
            { (login) ? 
                <>
                    <div className="left">
                        <div className="content">
                            <h1>Maba. </h1>
                            <div className="item" >Kenalan Yuk !</div>
                            <div className="item">Masukkan Kode</div>

                            <div className="item active" onClick={create}>Buat Room</div>
                            <div className="item">Donasi</div>

                        </div>
                    </div>  
                    <div className="right">
                        <div className="content">
                            {
                                showRoom()
                            }
                        </div>
                    </div>
                </>

            : <div className="right">
                <form id="login-form" className="content">
                <h1 className="item">
                    Form
                </h1>
                <input type="text" className="item" value={loginState.name} placeholder="Name" />
                <select className="item" value={loginState.major}>
                    <option value="">
                            Select Major
                    </option>
                    <option value="Informatika">
                            Informatika
                    </option>
                </select>
                <select className="item" value={loginState.year}>
                    <option value="">
                            Select Student Year
                    </option>
                    <option value="2021">
                            Student Year 2021
                    </option>
                </select>
                    <div className="item twogender">
                        <div className="gender">
                            Male
                        </div>
                        <div className="gender active">
                            Female
                        </div>
                    </div>
                <div className="item active" onClick={updateLogin}>Login</div>
                </form>
            </div> 
            }
            
        </div>
    );
};

export default Home;

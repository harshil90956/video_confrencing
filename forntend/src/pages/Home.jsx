import React, { useState } from 'react'
import withAuth from '../utils/Auth.jsx'
import { useNavigate } from 'react-router-dom';
import '../App.css'
import { Button, IconButton, TextField } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext.jsx';


function Home() {

    let navigate = useNavigate();
    const {addToUserHistory} = useContext(AuthContext)
    const [meetingCode, setMeetingCode] = useState("");
    let handleJoinVideoCall = async () => {
        await addToUserHistory(meetingCode);
        navigate(`/${meetingCode}`)
    }

    return (
        <>
            <div className="navBar" >
                <div style={{ display: "flex", alignItems: "center" }}>
                    <h2>BeamTalk</h2>
                </div>

                <div style={{ display: "flex", alignItems: "center" }}>
                    <IconButton onClick={
                        ()=>{
                            navigate('/history');
                        }
                    }>
                        <RestoreIcon />
                    </IconButton>
                    <p>History</p>
                    <Button onClick={() => { localStorage.removeItem("token"); navigate('/auth') }}>Logout</Button>
                </div>

            </div>

            <div className='meetContainer'>
                <div className="leftPanel">
                   <div>
                    <h2>Providing Quality Video Call</h2>
                    <div style={{display:'flex', gap:'10px'}}>
                        <TextField onChange={e => setMeetingCode(e.target.value)} id="outlined-basic" label="Meeting Code" variant='outlined' />
                        <Button onClick={handleJoinVideoCall} variant='contained' >Join</Button>
                    </div>
                   </div>
                </div>

               <div className='rightPanel'>
                   <img srcSet='/logo3.png' alt=''/>
               </div>

            </div>
        </>
    )
}

export default withAuth(Home);
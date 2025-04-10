import React,{useState,useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import {useSocket} from '../context/socketprovider.jsx'
export default function Lobby() {
    const [roomId, setRoomId] = useState('')
    const [email, setEmail] = useState('')
    const socket = useSocket()
    const navigate = useNavigate()
    function submit(event){
        
        socket.emit('join_room', {roomId, email})
        event.preventDefault()
        navigate(`/room/${roomId}`)
        
    }
    useEffect(()=>{
        
      socket.on('joined_room',data=>{
          console.log(data)
      })
  },[socket])
  return (
    <div>

        <form onSubmit={submit}>
            <input type='text' name='email' placeholder='enter mail' onChange={(event)=>setEmail(event.target.value)}/>
            <input type='text' name='email' placeholder='enter roomid' onChange={(event)=>setRoomId(event.target.value)}/>
            <button type='submit'>join </button>
              </form>
    </div>
  )
}

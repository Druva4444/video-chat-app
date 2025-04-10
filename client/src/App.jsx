
import './App.css'
import Lobby from './screens/Lobby'
import Room from './screens/Room'
import {Route,Routes} from 'react-router-dom'
function App() {

  return (
    <>
    <Routes>
      <Route path="/" element={<Lobby />} />
      <Route path='/room/:id' element={<Room />} />
</Routes>
    
    </>
  )
}

export default App

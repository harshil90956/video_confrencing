
import './App.css';
import {Route, Routes} from 'react-router-dom';
import Landing from './pages/Landing';
import Authentication from './pages/Authentication';
import VideoMeet from './pages/VideoMeet.jsx';
import Home from './pages/Home.jsx';
import History from './pages/History.jsx';

function App() {
  return (
   <div className='App'>
    
      
         <Routes> 
           
           <Route path='/' element={<Landing/>}/>
           <Route path='/auth' element={<Authentication/>}/>
           <Route path='/home' element={<Home/>}/>          
           <Route path='/history' element={<History/>} />
           <Route path='/:url' element={<VideoMeet/>} />

         </Routes>
 
   </div>
  );
}

export default App;

import './App.css'
import { BrowserRouter,Routes,Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginSignUp from './pages/LoginSignUp'
import { Home } from './pages/home'
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element = {<LandingPage/>}/>
        <Route path='/login' element = {<LoginSignUp/>}/>
        <Route path='/home' element = {<Home/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App

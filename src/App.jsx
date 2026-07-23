import { useState } from 'react'
import './App.css'
import Dashboard from './pages/Dashboard'
import './index.css'
import { HashRouter, Route, Routes } from 'react-router-dom'
import Game from './pages/Game'
import Scorings from './pages/Scorings'

function App() {

  return (
    <HashRouter>
      <Routes>
        <Route path='/' element={<Dashboard/>}/>
        <Route path='/game' element={<Game/>}/>
        <Route path='/score' element={<Scorings/>}/>
      </Routes>
    </HashRouter>
  )
}

export default App

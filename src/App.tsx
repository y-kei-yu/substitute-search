import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { SubstituteSearch } from './pages/SubstituteSearch';
import { Login } from './pages/Login';
import { Register } from './pages/Register';



function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/substitute-search" element={<SubstituteSearch />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App

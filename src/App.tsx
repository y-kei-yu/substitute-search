import './App.css'
import { Route, Routes } from 'react-router-dom';
import { SubstituteSearch } from './pages/substituteSearch';
import { Login } from './pages/login';
import { Register } from './pages/register';



function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/substitute-search" element={<SubstituteSearch />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  )
}

export default App

import './App.css'
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { SubstituteSearch } from './pages/substituteSearch';


function App() {
  const location = useLocation();

  return (
    <>

      {/* パスが "/" のときだけナビゲーション表示 */}
      {location.pathname === '/' && (
        <nav>
          <ul>
            {/* githubactionsテストエラー防止後で削除 */}
            <li data-testid="testTitle"><Link to="/substitute-search">substitute Search</Link></li>
          </ul>

        </nav>

      )}
      <Routes>
        <Route path="/" element={<div>開発用ナビゲーション画面</div>} />
        <Route path="/substitute-search" element={<SubstituteSearch />} />
      </Routes>
    </>
  )
}

export default App

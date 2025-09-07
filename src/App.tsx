import { useEffect } from 'react';
import './App.css'
import { fetchUser } from './service/fetchUser'


function App() {

  useEffect(() => {
    const fetchUserData = async () => {
      const user = await fetchUser();
      console.log("user data from App:", user);
    };
    fetchUserData();
  }, []);
  return (
    <>
      <h1 data-testid="testTitle">Vite + React test 自動デプロイ確認</h1>
      <h1 className="text-3xl font-bold underline text-blue-500">
        Hello world!
      </h1>
      <button className="bg-yellow-500 hover:bg-green-300 text-white font-bold py-2 px-4 rounded">
        Click me
      </button>

    </>
  )
}

export default App

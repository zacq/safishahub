import { useState } from "react";
import Home from "./components/Home";
import Records from "./components/Records";
import Admin from "./components/Admin";

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  return (
    <>
      {currentPage === 'home' && <Home onNavigate={handleNavigate} />}
      {currentPage === 'records' && <Records onNavigate={handleNavigate} />}
      {currentPage === 'admin' && <Admin onNavigate={handleNavigate} />}
    </>
  );
}

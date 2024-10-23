import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LogStreaming from './Components/LogStreaming.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/app/index.html" element={<LogStreaming />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

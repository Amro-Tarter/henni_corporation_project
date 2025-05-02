import { Routes, Route } from 'react-router-dom';
import SignUp from './pages/SignUp';
import LogIn from './pages/logIn';
import ForgotPassword from './pages/forgotPassword';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LogIn />} />
      <Route path="/forgotPassword" element={<ForgotPassword />} />
      <Route path="/signUp" element={<SignUp />} />


    </Routes>
  );
}

export default App;

import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectAuthUser } from './store/auth/authSlice';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import CourseDetail from './pages/CourseDetail/CourseDetail';
import Cart from './pages/Cart/Cart';
import Checkout from './pages/Checkout/Checkout';
import Payment from './pages/Payment/Payment';
import Confirmation from './pages/Confirmation/Confirmation';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import Account from './pages/Account/Account';
import TrackEnrollment from './pages/TrackEnrollment/TrackEnrollment';
import SearchResults from './pages/SearchResults/SearchResults';
import Admin from './pages/Admin/Admin';
import './App.css';

function RequireAuth({ children }) {
  const user = useSelector(selectAuthUser);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname }, replace: true });
    }
  }, [user, location.pathname, navigate]);

  if (!user) return null;

  return children;
}

function App() {
  return (
    <>
      <Header />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/course/:id" element={<CourseDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
          <Route path="/payment" element={<RequireAuth><Payment /></RequireAuth>} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/account" element={<Account />} />
          <Route path="/courses" element={<Navigate to="/account?tab=courses" replace />} />
          <Route path="/track-enrollment" element={<TrackEnrollment />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;

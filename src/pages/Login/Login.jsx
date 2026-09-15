import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginUser } from '../../store/auth/authSlice';
import { isValidEmail, isRequired } from '../../utils/validators';
import '../Checkout/Checkout.css';
import './Login.css';

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      setError('Enter a valid email address');
      return;
    }
    if (!isRequired(password)) {
      setError('Password is required');
      return;
    }

    const result = await dispatch(loginUser(email, password));
    if (result.error) {
      setError(result.error);
      return;
    }

    navigate(location.state?.from || '/account', { replace: true });
  };

  return (
    <main className="checkout">
      <div className="auth">
        <form className="checkout__section auth__form" onSubmit={handleSubmit}>
          <h2 className="checkout__section-heading">Log In</h2>

          {error && <p className="checkout__error auth__error">{error}</p>}

          <label className="checkout__field">
            <span>Email Address</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>

          <label className="checkout__field">
            <span>Password</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>

          <button type="submit" className="checkout__submit">Log In</button>

          <p className="auth__switch">
            Don't have an account? <Link to="/signup" state={location.state}>Sign Up</Link>
          </p>
        </form>
      </div>
    </main>
  );
}

export default Login;

import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { signupUser } from '../../store/auth/authSlice';
import { isRequired, isValidEmail, isValidMobile } from '../../utils/validators';
import '../Checkout/Checkout.css';
import '../Login/Login.css';

function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: '', email: '', mobile: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'mobile') {
      setForm((prev) => ({ ...prev, mobile: value.replace(/\D/g, '').slice(0, 10) }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isRequired(form.name)) return setError('Name is required');
    if (!isValidEmail(form.email)) return setError('Enter a valid email address');
    if (!isValidMobile(form.mobile)) return setError('Enter a valid 10-digit mobile number');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');

    const result = await dispatch(signupUser(form.name, form.email, form.mobile, form.password));
    if (result.error) return setError(result.error);

    navigate(location.state?.from || '/account', { replace: true });
  };

  return (
    <main className="checkout">
      <div className="auth">
        <form className="checkout__section auth__form" onSubmit={handleSubmit}>
          <h2 className="checkout__section-heading">Sign Up</h2>

          {error && <p className="checkout__error auth__error">{error}</p>}

          <label className="checkout__field">
            <span>Full Name</span>
            <input type="text" name="name" value={form.name} onChange={handleChange} />
          </label>

          <label className="checkout__field">
            <span>Email Address</span>
            <input type="email" name="email" value={form.email} onChange={handleChange} />
          </label>

          <label className="checkout__field">
            <span>Mobile Number</span>
            <input type="tel" name="mobile" value={form.mobile} onChange={handleChange} placeholder="9876543210" />
          </label>

          <label className="checkout__field">
            <span>Password</span>
            <input type="password" name="password" value={form.password} onChange={handleChange} />
          </label>

          <label className="checkout__field">
            <span>Confirm Password</span>
            <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} />
          </label>

          <button type="submit" className="checkout__submit">Sign Up</button>

          <p className="auth__switch">
            Already have an account? <Link to="/login">Log In</Link>
          </p>
        </form>
      </div>
    </main>
  );
}

export default Signup;

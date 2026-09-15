import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectAuthUser,
  logoutAction,
  updateProfileUser,
} from '../../store/auth/authSlice';
import {
  fetchEnrollmentsForAccount,
  selectEnrollmentsList,
} from '../../store/enrollments/enrollmentsSlice';
import EnrollmentCard from '../../components/EnrollmentCard/EnrollmentCard';
import { isRequired, isValidMobile } from '../../utils/validators';
import '../Checkout/Checkout.css';
import './Account.css';

const TABS = [
  { key: 'profile', label: 'Profile' },
  { key: 'courses', label: 'My Courses' },
];

function Account() {
  const dispatch = useDispatch();
  const user = useSelector(selectAuthUser);
  const enrollments = useSelector(selectEnrollmentsList);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'courses' ? 'courses' : 'profile';

  const [form, setForm] = useState({ name: '', mobile: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true, state: { from: '/account' } });
      return;
    }
    setForm({ name: user.name || '', mobile: user.mobile || '' });
    dispatch(fetchEnrollmentsForAccount(user.email));
  }, [user, navigate, dispatch]);

  if (!user) return null;

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
    setMessage('');

    if (!isRequired(form.name)) return setError('Name is required');
    if (!isValidMobile(form.mobile)) return setError('Enter a valid 10-digit mobile number');

    setError('');
    const res = await dispatch(updateProfileUser({ name: form.name, mobile: form.mobile }));
    if (res?.error) {
      setError(res.error);
    } else {
      setMessage('Profile updated.');
    }
  };

  const handleLogout = () => {
    dispatch(logoutAction());
    navigate('/');
  };

  const selectTab = (key) => {
    setSearchParams(key === 'profile' ? {} : { tab: key });
  };

  return (
    <main className="checkout">
      <div className="account">
        <aside className="account__sidebar">
          <div className="account__sidebar-user">
            <span className="account__avatar">{(user.name || 'U').charAt(0).toUpperCase()}</span>
            <div>
              <strong>{user.name}</strong>
              <small>{user.email}</small>
            </div>
          </div>

          <nav className="account__menu">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`account__menu-item${activeTab === tab.key ? ' active' : ''}`}
                onClick={() => selectTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
            <button type="button" className="account__menu-item account__menu-item--logout" onClick={handleLogout}>
              Log Out
            </button>
          </nav>
        </aside>

        <section className="account__content">
          {activeTab === 'profile' ? (
            <div className="checkout__section">
              <h2 className="checkout__section-heading">Account Details</h2>

              {message && <p className="account__message">{message}</p>}
              {error && <p className="checkout__error account__error">{error}</p>}

              <form onSubmit={handleSubmit}>
                <label className="checkout__field">
                  <span>Full Name</span>
                  <input type="text" name="name" value={form.name} onChange={handleChange} />
                </label>

                <label className="checkout__field">
                  <span>Email Address</span>
                  <input type="email" value={user.email} disabled />
                </label>

                <label className="checkout__field">
                  <span>Mobile Number</span>
                  <input type="tel" name="mobile" value={form.mobile} onChange={handleChange} />
                </label>

                <button type="submit" className="checkout__submit">Save Changes</button>
              </form>
            </div>
          ) : (
            <div className="checkout__section">
              <h2 className="checkout__section-heading">My Courses</h2>

              {enrollments.length === 0 ? (
                <div className="checkout__empty">
                  <p>You haven't enrolled in any courses yet.</p>
                  <Link to="/" className="checkout__empty-link">Browse Courses →</Link>
                </div>
              ) : (
                <div className="account__orders-list">
                  {enrollments.map((enrollment) => (
                    <EnrollmentCard key={enrollment.enrollmentNumber} enrollment={enrollment} />
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default Account;

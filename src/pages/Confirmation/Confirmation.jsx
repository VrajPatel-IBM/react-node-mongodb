import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearCart } from '../../store/cart/cartSlice';
import EnrollSteps from '../../components/EnrollSteps/EnrollSteps';
import EnrollmentCard from '../../components/EnrollmentCard/EnrollmentCard';
import './Confirmation.css';

function Confirmation() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const enrollment = location.state?.enrollment;

  useEffect(() => {
    if (!enrollment) {
      navigate('/', { replace: true });
    }
  }, [enrollment, navigate]);

  useEffect(() => {
    if (enrollment) {
      dispatch(clearCart());
    }
    // Clear the cart once the confirmation page actually mounts with a placed
    // order, instead of in Payment right before navigating away — doing it there
    // raced with Payment's own empty-cart redirect guard.
  }, [enrollment, dispatch]);

  if (!enrollment) return null;

  return (
    <main className="checkout">
      <EnrollSteps current="Confirmation" />

      <div className="confirmation">
        <div className="confirmation__badge">✓</div>
        <h1 className="confirmation__heading">You're Enrolled!</h1>
        <p className="confirmation__subtext">
          Your enrollment was placed successfully.
          <br />
          You'll get instant access to your course materials.
        </p>

        <div className="confirmation__cards">
          <EnrollmentCard enrollment={enrollment} />

          <div className="confirmation__card">
            <h2 className="checkout__section-heading">What Happens Next?</h2>
            <ul className="confirmation__steps-list">
              <li><span>🎓</span> Your course access is unlocked immediately</li>
              <li><span>📅</span> We'll email you cohort start dates if applicable</li>
              <li><span>🎧</span> Your mentor/support contact will reach out within 48 hours</li>
            </ul>
            <p className="confirmation__email-note">
              ✉️ A confirmation email has been sent to {enrollment.userEmail}
            </p>
            <p className="confirmation__email-note">
              📦 Save your Order ID (<strong>{enrollment.enrollmentNumber}</strong>) and email — you can check
              your order anytime at <Link to="/track-enrollment">Track Enrollment</Link>, no sign-in required.
            </p>
          </div>
        </div>

        <Link to="/" className="checkout__submit confirmation__continue">Keep Browsing Courses</Link>
      </div>
    </main>
  );
}

export default Confirmation;

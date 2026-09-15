import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { lookupEnrollmentByNumber } from '../../store/enrollments/enrollmentsSlice';
import { isRequired, isValidEmail } from '../../utils/validators';
import EnrollmentCard from '../../components/EnrollmentCard/EnrollmentCard';
import '../Checkout/Checkout.css';
import './TrackEnrollment.css';

function TrackEnrollment() {
  const dispatch = useDispatch();
  const [enrollmentNumber, setEnrollmentNumber] = useState('');
  const [email, setEmail] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult(null);

    if (!isRequired(enrollmentNumber)) return setError('Enter your Order ID');
    if (!isValidEmail(email)) return setError('Enter a valid email address');

    const enrollment = await dispatch(lookupEnrollmentByNumber(enrollmentNumber.trim().toUpperCase()));
    if (!enrollment || enrollment.userEmail.toLowerCase() !== email.trim().toLowerCase()) {
      setError('No matching enrollment found. Check your enrollment number and email.');
      return;
    }

    setError('');
    setResult(enrollment);
  };

  return (
    <main className="checkout">
      <div className="track-enrollment">
        <form className="checkout__section" onSubmit={handleSubmit}>
          <h2 className="checkout__section-heading">Track Your Enrollment</h2>

          {error && <p className="checkout__error track-enrollment__error">{error}</p>}

          <label className="checkout__field">
            <span>Order ID</span>
            <input
              type="text"
              value={enrollmentNumber}
              onChange={(e) => setEnrollmentNumber(e.target.value)}
              placeholder="ENR12345678"
            />
          </label>

          <label className="checkout__field">
            <span>Email Address</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>

          <button type="submit" className="checkout__submit">Track Enrollment</button>
        </form>

        {result && (
          <div className="track-enrollment__result">
            <EnrollmentCard enrollment={result} />
          </div>
        )}
      </div>
    </main>
  );
}

export default TrackEnrollment;

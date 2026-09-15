import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectCartItems, selectCartSubtotal } from '../../store/cart/cartSlice';
import { selectAuthUser } from '../../store/auth/authSlice';
import { placeEnrollment } from '../../store/enrollments/enrollmentsSlice';
import EnrollSteps from '../../components/EnrollSteps/EnrollSteps';
import EnrollmentSummary from '../../components/EnrollmentSummary/EnrollmentSummary';
import { PLATFORM_FEE_RATE, SUPPORT_TIERS } from '../../utils/pricing';
import '../Checkout/Checkout.css';
import './Payment.css';

function formatAddress(address) {
  return (
    <>
      {address.fullName}
      <br />
      {address.address}
      {address.apartment ? `, ${address.apartment}` : ''}
      <br />
      {address.city}, {address.state} {address.zip}
      <br />
      {address.country}
    </>
  );
}

function Payment() {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const rawSubtotal = useSelector(selectCartSubtotal);
  const subtotal = Number(rawSubtotal);
  const user = useSelector(selectAuthUser);
  const location = useLocation();
  const navigate = useNavigate();
  const checkoutInfo = location.state;
  const [paymentMethod, setPaymentMethod] = useState('');
  const [placing, setPlacing] = useState(false);

  const invalid = !checkoutInfo || items.length === 0;

  useEffect(() => {
    if (invalid) {
      navigate('/checkout', { replace: true });
    }
  }, [invalid, navigate]);

  if (invalid) return null;

  const { billingAddress, contact, supportPlan, cohortPreference } = checkoutInfo;
  const supportFee = SUPPORT_TIERS[supportPlan] ?? SUPPORT_TIERS.standard;
  const platformFee = subtotal * PLATFORM_FEE_RATE;
  const total = subtotal + supportFee + platformFee;

  const handlePlaceEnrollment = async () => {
    if (paymentMethod !== 'card') return;
    setPlacing(true);

    const enrollment = {
      userName: billingAddress.fullName,
      userEmail: contact.email,
      items: items.map((item) => ({
        courseId: item.id,
        title: item.title,
        tier: item.tier || '',
        price: item.price,
        quantity: item.quantity,
        thumbnail: item.thumbnail || '',
      })),
      subtotal,
      platformFee,
      supportFee,
      total,
      paymentMethod: 'card',
      billingAddress: {
        line1: `${billingAddress.address}${billingAddress.apartment ? `, ${billingAddress.apartment}` : ''}`,
        city: billingAddress.city,
        state: billingAddress.state,
        zip: billingAddress.zip,
        country: billingAddress.country,
      },
      cohortPreference: cohortPreference || 'self-paced',
      placedAt: new Date().toISOString(),
      ownerEmail: user?.email ?? null,
    };

    const result = await dispatch(placeEnrollment(enrollment));
    setPlacing(false);

    if (result.success) {
      navigate('/confirmation', {
        replace: true,
        state: { enrollment: result.enrollment },
      });
    }
  };

  return (
    <main className="checkout">
      <EnrollSteps current="Payment" />

      <div className="checkout__layout">
        <div className="checkout__form">
          <section className="checkout__section">
            <h2 className="checkout__section-heading">Payment Method</h2>
            <p className="payment__hint">Select your preferred payment method</p>

            <label className={`checkout__shipping-option${paymentMethod === 'card' ? ' active' : ''}`}>
              <span className="checkout__shipping-left">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                />
                <span>
                  <strong>💳 Pay by Card</strong>
                  <small>Visa, Mastercard, or Amex — charged securely at enrollment.</small>
                </span>
              </span>
            </label>

            <div className="payment__secure-note">
              <span>🛡️</span>
              <div>
                <strong>Safe &amp; Secure</strong>
                <p>Your payment details are encrypted and never stored on our servers.</p>
              </div>
            </div>
          </section>
        </div>

        <aside className="checkout__summary">
          <h2 className="checkout__section-heading">Enrollment Summary</h2>

          <EnrollmentSummary
            items={items}
            subtotal={subtotal}
            supportFee={supportFee}
            platformFee={platformFee}
            total={total}
            supportLabel={supportPlan === 'priority' ? 'Priority Support' : 'Standard Support'}
          />

          <div className="payment__address">
            <strong>Billing Address</strong>
            <p>{formatAddress(billingAddress)}</p>
          </div>

          <button
            type="button"
            className="checkout__submit"
            disabled={paymentMethod !== 'card' || placing}
            onClick={handlePlaceEnrollment}
          >
            {placing ? 'Processing...' : 'Confirm & Enroll'}
          </button>

          <p className="checkout__secure">You will get instant access after payment is confirmed.</p>

          <Link to="/checkout" className="payment__back">← Back to Checkout</Link>
        </aside>
      </div>
    </main>
  );
}

export default Payment;

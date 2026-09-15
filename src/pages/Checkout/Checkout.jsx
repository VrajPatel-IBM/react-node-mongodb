import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCartItems, selectCartSubtotal } from '../../store/cart/cartSlice';
import EnrollSteps from '../../components/EnrollSteps/EnrollSteps';
import EnrollmentSummary from '../../components/EnrollmentSummary/EnrollmentSummary';
import { PLATFORM_FEE_RATE, SUPPORT_TIERS } from '../../utils/pricing';
import { isRequired, isValidEmail, isValidMobile, isValidZip } from '../../utils/validators';
import './Checkout.css';

const EMPTY_ADDRESS = {
  fullName: '',
  address: '',
  apartment: '',
  city: '',
  state: '',
  zip: '',
  country: 'United States',
};

function validateAddress(addr, prefix, errs) {
  if (!isRequired(addr.fullName)) errs[`${prefix}.fullName`] = 'Full name is required';
  if (!isRequired(addr.address)) errs[`${prefix}.address`] = 'Address is required';
  if (!isRequired(addr.city)) errs[`${prefix}.city`] = 'City is required';
  if (!isRequired(addr.state)) errs[`${prefix}.state`] = 'State is required';
  if (!isValidZip(addr.zip)) errs[`${prefix}.zip`] = 'Enter a valid ZIP / postal code';
}

function AddressFields({ values, onChange, onBlur, errorFor }) {
  return (
    <>
      <label className={`checkout__field${errorFor('fullName') ? ' invalid' : ''}`}>
        <span>Full Name</span>
        <input type="text" name="fullName" value={values.fullName} onChange={onChange} onBlur={onBlur} />
        {errorFor('fullName') && <small className="checkout__error">{errorFor('fullName')}</small>}
      </label>

      <label className={`checkout__field${errorFor('address') ? ' invalid' : ''}`}>
        <span>Address</span>
        <input type="text" name="address" value={values.address} onChange={onChange} onBlur={onBlur} />
        {errorFor('address') && <small className="checkout__error">{errorFor('address')}</small>}
      </label>

      <label className="checkout__field">
        <span>Apartment, suite, etc. (optional)</span>
        <input type="text" name="apartment" value={values.apartment} onChange={onChange} onBlur={onBlur} />
      </label>

      <div className="checkout__row checkout__row--3">
        <label className={`checkout__field${errorFor('city') ? ' invalid' : ''}`}>
          <span>City</span>
          <input type="text" name="city" value={values.city} onChange={onChange} onBlur={onBlur} />
          {errorFor('city') && <small className="checkout__error">{errorFor('city')}</small>}
        </label>
        <label className={`checkout__field${errorFor('state') ? ' invalid' : ''}`}>
          <span>State</span>
          <input type="text" name="state" value={values.state} onChange={onChange} onBlur={onBlur} />
          {errorFor('state') && <small className="checkout__error">{errorFor('state')}</small>}
        </label>
        <label className={`checkout__field${errorFor('zip') ? ' invalid' : ''}`}>
          <span>ZIP / Postal Code</span>
          <input type="text" name="zip" value={values.zip} onChange={onChange} onBlur={onBlur} placeholder="12345" />
          {errorFor('zip') && <small className="checkout__error">{errorFor('zip')}</small>}
        </label>
      </div>

      <label className="checkout__field">
        <span>Country</span>
        <select name="country" value={values.country} onChange={onChange} onBlur={onBlur}>
          <option>United States</option>
          <option>Canada</option>
          <option>United Kingdom</option>
          <option>India</option>
          <option>Australia</option>
        </select>
      </label>
    </>
  );
}

function Checkout() {
  const items = useSelector(selectCartItems);
  const rawSubtotal = useSelector(selectCartSubtotal);
  const subtotal = Number(rawSubtotal);
  const navigate = useNavigate();
  const [supportPlan, setSupportPlan] = useState('standard');
  const [cohortPreference, setCohortPreference] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [billing, setBilling] = useState(EMPTY_ADDRESS);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleBillingChange = (e) => {
    const { name, value } = e.target;
    setBilling((prev) => ({ ...prev, [name]: value }));
  };

  const markTouched = (key) => setTouched((prev) => ({ ...prev, [key]: true }));

  const errors = {};
  if (!isRequired(email)) errors.email = 'Email is required';
  else if (!isValidEmail(email)) errors.email = 'Enter a valid email address';
  if (!isValidMobile(phone)) errors.phone = 'Enter a valid 10-digit phone number';
  validateAddress(billing, 'billing', errors);

  const showError = (key) => (touched[key] || submitted) && errors[key];

  const handlePhoneChange = (e) => {
    setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length > 0) return;

    navigate('/payment', {
      state: {
        contact: { email, phone },
        billingAddress: billing,
        supportPlan,
        cohortPreference,
      },
    });
  };

  if (items.length === 0) {
    return (
      <main className="checkout">
        <div className="checkout__empty">
          <p>Your cart is empty. Enroll in a course first.</p>
          <Link to="/" className="checkout__empty-link">Browse Courses →</Link>
        </div>
      </main>
    );
  }

  const supportFee = SUPPORT_TIERS[supportPlan];
  const platformFee = subtotal * PLATFORM_FEE_RATE;
  const total = subtotal + supportFee + platformFee;

  return (
    <main className="checkout">
      <EnrollSteps current="Checkout" />

      <form className="checkout__layout" onSubmit={handleSubmit}>
        <div className="checkout__form">
          <section className="checkout__section">
            <h2 className="checkout__section-heading">Contact Information</h2>
            <div className="checkout__row">
              <label className={`checkout__field${showError('email') ? ' invalid' : ''}`}>
                <span>Email Address</span>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => markTouched('email')}
                />
                {showError('email') && <small className="checkout__error">{errors.email}</small>}
              </label>
              <label className={`checkout__field${showError('phone') ? ' invalid' : ''}`}>
                <span>Phone Number</span>
                <input
                  type="tel"
                  name="phone"
                  value={phone}
                  onChange={handlePhoneChange}
                  onBlur={() => markTouched('phone')}
                  placeholder="1234567890"
                />
                {showError('phone') && <small className="checkout__error">{errors.phone}</small>}
              </label>
            </div>
          </section>

          <section className="checkout__section">
            <h2 className="checkout__section-heading">Billing Address</h2>
            <AddressFields
              values={billing}
              onChange={handleBillingChange}
              onBlur={(e) => markTouched(`billing.${e.target.name}`)}
              errorFor={(field) => showError(`billing.${field}`)}
            />
          </section>

          <section className="checkout__section">
            <h2 className="checkout__section-heading">Cohort Start Preference</h2>
            <label className="checkout__field">
              <span>When would you like to start? (optional)</span>
              <select value={cohortPreference} onChange={(e) => setCohortPreference(e.target.value)}>
                <option value="">No preference — start anytime (self-paced)</option>
                <option value="next-cohort">Next available live cohort</option>
                <option value="within-30-days">Within the next 30 days</option>
                <option value="flexible">Flexible / TBD with mentor</option>
              </select>
            </label>
          </section>

          <section className="checkout__section">
            <h2 className="checkout__section-heading">Support Plan</h2>

            <label className={`checkout__shipping-option${supportPlan === 'standard' ? ' active' : ''}`}>
              <span className="checkout__shipping-left">
                <input
                  type="radio"
                  name="supportPlan"
                  value="standard"
                  checked={supportPlan === 'standard'}
                  onChange={() => setSupportPlan('standard')}
                />
                <span>
                  <strong>Standard Support</strong>
                  <small>Community forum &amp; email support, 48hr response</small>
                </span>
              </span>
              <span className="checkout__shipping-price">${SUPPORT_TIERS.standard.toFixed(2)}</span>
            </label>

            <label className={`checkout__shipping-option${supportPlan === 'priority' ? ' active' : ''}`}>
              <span className="checkout__shipping-left">
                <input
                  type="radio"
                  name="supportPlan"
                  value="priority"
                  checked={supportPlan === 'priority'}
                  onChange={() => setSupportPlan('priority')}
                />
                <span>
                  <strong>Priority Support</strong>
                  <small>Direct mentor access, 4hr response</small>
                </span>
              </span>
              <span className="checkout__shipping-price">${SUPPORT_TIERS.priority.toFixed(2)}</span>
            </label>
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

          <button type="submit" className="checkout__submit">Continue to Payment</button>
          <p className="checkout__secure">🔒 Your payment information is secure</p>
        </aside>
      </form>
    </main>
  );
}

export default Checkout;

import { Link } from 'react-router-dom';
import './EnrollSteps.css';

const STEPS = ['Cart', 'Checkout', 'Payment', 'Confirmation'];
const STEP_LINKS = { Cart: '/cart', Checkout: '/checkout' };

function EnrollSteps({ current }) {
  const currentIndex = STEPS.indexOf(current);

  return (
    <ol className="enroll-steps">
      {STEPS.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        const link = done ? STEP_LINKS[step] : null;

        return (
          <li key={step} className="enroll-steps__item">
            <span className={`enroll-steps__step${done ? ' done' : ''}${active ? ' active' : ''}`}>
              {link ? (
                <Link to={link}>
                  <span className="enroll-steps__num">✓</span>
                  {step}
                </Link>
              ) : (
                <>
                  <span className="enroll-steps__num">{done ? '✓' : i + 1}</span>
                  {step}
                </>
              )}
            </span>
            {i < STEPS.length - 1 && <span className="enroll-steps__line" aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
  );
}

export default EnrollSteps;

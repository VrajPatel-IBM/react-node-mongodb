import { ENROLLMENT_STATUSES, getEnrollmentStatusIndex } from '../../utils/enrollmentStatus';
import EnrollmentSummary from '../EnrollmentSummary/EnrollmentSummary';
import '../../pages/Confirmation/Confirmation.css';
import './EnrollmentCard.css';

function EnrollmentCard({ enrollment }) {
  const placedAt = new Date(enrollment.placedAt);
  const statusIndex = getEnrollmentStatusIndex(enrollment);

  const itemsSubtotal = (enrollment.items || []).reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
  const subtotal = Number(enrollment.subtotal ?? itemsSubtotal);
  const supportFee = Number(enrollment.supportFee ?? 0);
  const platformFee = Number(enrollment.platformFee ?? Math.max(Number(enrollment.total) - subtotal - supportFee, 0));

  return (
    <div className="confirmation__card enrollment-card">
      <div className="confirmation__order-box">
        <span>Order ID</span>
        <strong>{enrollment.enrollmentNumber}</strong>
        <p>
          {placedAt.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })} ·{' '}
          {placedAt.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
        </p>
      </div>

      <ol className="enrollment-card__status">
        {ENROLLMENT_STATUSES.map((status, i) => (
          <li
            key={status}
            className={`enrollment-card__status-step${i <= statusIndex ? ' done' : ''}${i === statusIndex ? ' active' : ''}`}
          >
            <span className="enrollment-card__status-dot">{i < statusIndex ? '✓' : i + 1}</span>
            <span className="enrollment-card__status-label">{status}</span>
            {i < ENROLLMENT_STATUSES.length - 1 && <span className="enrollment-card__status-line" aria-hidden="true" />}
          </li>
        ))}
      </ol>

      <span className="confirmation__cod-badge enrollment-card__pay-badge">Paid by Card</span>

      <div className="enrollment-card__bill">
        <EnrollmentSummary items={enrollment.items || []} subtotal={subtotal} supportFee={supportFee} platformFee={platformFee} total={Number(enrollment.total)} />
      </div>
    </div>
  );
}

export default EnrollmentCard;

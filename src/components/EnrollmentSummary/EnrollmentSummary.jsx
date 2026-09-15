import '../../pages/Checkout/Checkout.css';

function EnrollmentSummary({ items, platformFee, supportFee, subtotal, total, supportLabel = 'Support Plan' }) {
  return (
    <>
      <div className="checkout__summary-items">
        {items.map((item) => (
          <div className="checkout__summary-item" key={`${item.id ?? item.courseId}-${item.tier}`}>
            <img src={item.thumbnail} alt={item.title} />
            <div className="checkout__summary-item-body">
              <p className="checkout__summary-item-title">{item.title}</p>
              {item.tier && <p className="checkout__summary-item-meta">Plan: {item.tier}</p>}
              <p className="checkout__summary-item-meta">Qty: {item.quantity}</p>
            </div>
            <p className="checkout__summary-item-price">${(Number(item.price) * Number(item.quantity)).toFixed(2)}</p>
          </div>
        ))}
      </div>

      <div className="checkout__summary-totals">
        <div>
          <span>Subtotal</span>
          <span>${Number(subtotal).toFixed(2)}</span>
        </div>
        <div>
          <span>{supportLabel}</span>
          <span>${Number(supportFee).toFixed(2)}</span>
        </div>
        <div>
          <span>Platform Fee (8.25%)</span>
          <span>${Number(platformFee).toFixed(2)}</span>
        </div>
      </div>

      <div className="checkout__summary-total">
        <span>Total</span>
        <span>${Number(total).toFixed(2)}</span>
      </div>
    </>
  );
}

export default EnrollmentSummary;

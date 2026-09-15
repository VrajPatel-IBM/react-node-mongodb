import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  removeFromCart,
  updateQuantity,
  selectCartItems,
  selectCartSubtotal,
} from '../../store/cart/cartSlice';
import './Cart.css';

function Cart() {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const navigate = useNavigate();

  const handleRemove = (item) => {
    dispatch(removeFromCart(item.id, item.tier));
  };

  const handleIncrease = (item) => {
    dispatch(updateQuantity(item.id, item.tier, Number(item.quantity) + 1));
  };

  const handleDecrease = (item) => {
    dispatch(updateQuantity(item.id, item.tier, Number(item.quantity) - 1));
  };

  if (items.length === 0) {
    return (
      <main className="cart">
        <h1 className="cart__heading">Your Cart</h1>
        <div className="cart__empty">
          <p>You haven't added any courses yet.</p>
          <Link to="/" className="cart__continue">Browse Courses →</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="cart">
      <h1 className="cart__heading">Your Cart</h1>

      <div className="cart__items">
        {items.map((item) => (
          <div className="cart-item" key={`${item.id}-${item.tier}`}>
            <Link to={`/course/${item.id}`} className="cart-item__image-wrap">
              <img src={item.thumbnail} alt={item.title} />
            </Link>

            <div className="cart-item__body">
              <div className="cart-item__head">
                <Link to={`/course/${item.id}`} className="cart-item__title">{item.title}</Link>
                <button
                  className="cart-item__remove"
                  onClick={() => handleRemove(item)}
                  aria-label={`Remove ${item.title}`}
                  title="Remove"
                >
                  🗑
                </button>
              </div>

              {item.tier && (
                <p className="cart-item__variant">
                  <span>Plan: {item.tier}</span>
                </p>
              )}

              <div className="cart-item__footer">
                <div className="cart-item__qty">
                  <button onClick={() => handleDecrease(item)} aria-label="Decrease seats">−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => handleIncrease(item)} aria-label="Increase seats">+</button>
                </div>

                <p className="cart-item__price">${(Number(item.price) * Number(item.quantity)).toFixed(2)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="cart__subtotal">
        <span>Subtotal</span>
        <span className="cart__subtotal-price">${Number(subtotal).toFixed(2)}</span>
      </div>

      <p className="cart__note">Platform fee and support plan calculated at checkout</p>

      <button className="cart__checkout" onClick={() => navigate('/checkout')}>Checkout</button>
    </main>
  );
}

export default Cart;

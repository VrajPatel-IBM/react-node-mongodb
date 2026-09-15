import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, updateQuantity, selectCartItems } from '../../store/cart/cartSlice';
import './CourseCard.css';

function CourseCard({ course }) {
  const { id, title, price, thumbnail, rating, instructor, seatsRemaining, priceTiers } = course;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);

  const defaultTier = priceTiers?.[0]?.name || 'Self-Paced';
  const parsedRating = Number(rating || 5);
  const stars = '★'.repeat(Math.round(parsedRating)) + '☆'.repeat(Math.max(0, 5 - Math.round(parsedRating)));
  const cartItem = items.find((item) => item.id === id && item.tier === defaultTier);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    dispatch(addToCart(course));
  };

  const handleIncrease = (e) => {
    e.stopPropagation();
    dispatch(updateQuantity(id, defaultTier, (cartItem?.quantity || 1) + 1));
  };

  const handleDecrease = (e) => {
    e.stopPropagation();
    dispatch(updateQuantity(id, defaultTier, (cartItem?.quantity || 1) - 1));
  };

  return (
    <div className="course-card" onClick={() => navigate(`/course/${id}`)}>
      <div className="course-card__image-wrap">
        <img className="course-card__image" src={thumbnail} alt={title} />
        {seatsRemaining <= 5 && seatsRemaining > 0 && (
          <span className="course-card__seats-badge">{seatsRemaining} seats left</span>
        )}
      </div>
      <p className="course-card__rating">{stars}</p>
      <h3 className="course-card__title">{title}</h3>
      <p className="course-card__instructor">by {instructor}</p>
      <p className="course-card__price">${Number(price).toFixed(2)}</p>

      {cartItem ? (
        <div className="course-card__qty">
          <button onClick={handleDecrease} aria-label="Decrease quantity">−</button>
          <span>{cartItem.quantity} in cart</span>
          <button onClick={handleIncrease} aria-label="Increase quantity">+</button>
        </div>
      ) : (
        <button className="course-card__add-btn" onClick={handleAddToCart}>
          Enroll Now
        </button>
      )}
    </div>
  );
}

export default CourseCard;

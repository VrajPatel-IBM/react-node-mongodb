import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import CourseGallery from '../../components/CourseGallery/CourseGallery';
import CourseCard from '../../components/CourseCard/CourseCard';
import { addToCart } from '../../store/cart/cartSlice';
import {
  fetchCourseDetail,
  selectCourseDetail,
  selectRelatedCourses,
  selectDetailLoading,
  selectDetailError,
} from '../../store/courses/coursesSlice';
import './CourseDetail.css';

const TABS = ['Description', 'Syllabus', 'Instructor', 'Details'];

function CourseDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const course = useSelector(selectCourseDetail);
  const related = useSelector(selectRelatedCourses);
  const loading = useSelector(selectDetailLoading);
  const error = useSelector(selectDetailError);

  const [tier, setTier] = useState(null);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setActiveTab(TABS[0]);
    setQty(1);
    setAdded(false);
    setTier(null);
    dispatch(fetchCourseDetail(id));
  }, [id, dispatch]);

  if (loading) {
    return (
      <main className="cdp">
        <p className="cdp__status">Loading course...</p>
      </main>
    );
  }

  if (error || !course) {
    return (
      <main className="cdp">
        <p className="cdp__status cdp__status--error">{error || 'Course not found.'}</p>
      </main>
    );
  }

  const {
    title,
    description = '',
    longDescription = '',
    category = '',
    skillLevel = 'Beginner',
    instructor = '',
    rating = 4.5,
    seatsTotal = 0,
    seatsEnrolled = 0,
    seatsRemaining = 0,
    syllabus = [],
    tags = [],
    images,
    thumbnail,
  } = course;

  const priceTiers = course.priceTiers?.length ? course.priceTiers : [{ name: 'Self-Paced', price: course.price }];
  const activeTierName = tier || priceTiers[0].name;
  const activeTier = priceTiers.find((t) => t.name === activeTierName) || priceTiers[0];

  const parsedRating = Number(rating || 5);
  const stars = '★'.repeat(Math.round(parsedRating)) + '☆'.repeat(Math.max(0, 5 - Math.round(parsedRating)));
  const gallery = images && images.length ? images : [thumbnail];
  const relatedCourses = (related || []).filter((c) => c.id !== course.id).slice(0, 4);

  const handleAddToCart = () => {
    dispatch(addToCart(course, qty, { tier: activeTierName }));
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <main className="cdp">
      <nav className="cdp__breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <span className="cdp__breadcrumb-cat">{category.replace(/-/g, ' ')}</span>
        <span>/</span>
        <span className="cdp__breadcrumb-current">{title}</span>
      </nav>

      <div className="cdp__top">
        <CourseGallery images={gallery} title={title} />

        <div className="cdp__info">
          <span className="cdp__badge">{skillLevel}</span>

          <h1 className="cdp__title">{title}</h1>

          <p className="cdp__meta">
            <span className="cdp__stars">{stars}</span>
            <span>{parsedRating.toFixed(1)} rating</span>
            <span className="cdp__instructor-meta">by {instructor}</span>
          </p>

          <p className="cdp__price">${Number(activeTier.price).toFixed(2)}</p>

          <p className="cdp__desc">{description}</p>

          <div className="cdp__option">
            <span className="cdp__option-label">Plan: <strong>{activeTierName}</strong></span>
            <div className="cdp__tiers">
              {priceTiers.map((t) => (
                <button
                  key={t.name}
                  className={`cdp__tier${activeTierName === t.name ? ' active' : ''}`}
                  onClick={() => setTier(t.name)}
                >
                  <span>{t.name}</span>
                  <strong>${Number(t.price).toFixed(2)}</strong>
                </button>
              ))}
            </div>
          </div>

          <div className="cdp__buy-row">
            <div className="cdp__qty">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
              <span>{qty}</span>
              <button onClick={() => setQty((q) => Math.min(Math.max(seatsRemaining, 1), q + 1))} aria-label="Increase quantity">+</button>
            </div>

            <button className="cdp__add-to-cart" onClick={handleAddToCart} disabled={seatsRemaining === 0}>
              {seatsRemaining === 0 ? 'Sold Out' : added ? 'Added ✓' : 'Enroll Now'}
            </button>
          </div>

          <p className="cdp__stock">
            {seatsRemaining > 0 ? `${seatsRemaining} of ${seatsTotal} seats left` : 'No seats remaining'}
          </p>

          <div className="cdp__perks">
            <div>
              <span>🎓</span>
              <div><strong>Lifetime Access</strong><small>Learn at your own pace, forever</small></div>
            </div>
            <div>
              <span>🔁</span>
              <div><strong>30-Day Guarantee</strong><small>Not happy? Get a full refund</small></div>
            </div>
            <div>
              <span>📜</span>
              <div><strong>Certificate</strong><small>Awarded on completion</small></div>
            </div>
          </div>
        </div>
      </div>

      <div className="cdp__tabs">
        <div className="cdp__tabs-nav">
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`cdp__tab${activeTab === tab ? ' active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="cdp__tabs-panel">
          {activeTab === 'Description' && <p>{longDescription || description}</p>}

          {activeTab === 'Syllabus' && (
            syllabus.length ? (
              <ol className="cdp__syllabus">
                {syllabus.map((item, i) => (
                  <li key={i}><span>{i + 1}</span>{item}</li>
                ))}
              </ol>
            ) : (
              <p>Syllabus coming soon.</p>
            )
          )}

          {activeTab === 'Instructor' && (
            <div className="cdp__instructor">
              <strong>{instructor}</strong>
              <p>Course instructor at LearnHub, teaching {category.replace(/-/g, ' ')} to thousands of students.</p>
            </div>
          )}

          {activeTab === 'Details' && (
            <ul className="cdp__spec-list">
              <li><strong>Skill Level</strong><span>{skillLevel}</span></li>
              <li><strong>Category</strong><span>{category.replace(/-/g, ' ')}</span></li>
              <li><strong>Seats</strong><span>{seatsEnrolled} enrolled / {seatsTotal} total</span></li>
              {tags.length > 0 && <li><strong>Tags</strong><span>{tags.join(', ')}</span></li>}
            </ul>
          )}
        </div>
      </div>

      {relatedCourses.length > 0 && (
        <section className="cdp__related">
          <h2 className="cdp__related-heading">You May Also Like</h2>
          <div className="cdp__related-grid">
            {relatedCourses.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

export default CourseDetail;

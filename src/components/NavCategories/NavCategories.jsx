import { useRef } from 'react';
import './NavCategories.css';

const COLORS = ['#e8e6fc', '#fce8f3', '#e6f4ea', '#fff3e0', '#f3e8ff', '#e8f5e9', '#fef9e7', '#fde8e8', '#e0f2fe', '#f5e8ff', '#e8f0fe', '#fef0e0'];

const CATEGORIES = [
  { category: 'programming', label: 'Programming', icon: '💻' },
  { category: 'data-ai', label: 'Data & AI', icon: '📊' },
  { category: 'design', label: 'Design', icon: '🎨' },
  { category: 'business', label: 'Business', icon: '💼' },
  { category: 'marketing', label: 'Marketing', icon: '📣' },
  { category: 'finance', label: 'Personal Finance', icon: '💰' },
  { category: 'photography', label: 'Photography & Video', icon: '📷' },
  { category: 'music', label: 'Music', icon: '🎵' },
  { category: 'fitness', label: 'Health & Fitness', icon: '🧘' },
  { category: 'language', label: 'Language Learning', icon: '🗣️' },
  { category: 'writing', label: 'Writing', icon: '✍️' },
  { category: 'career', label: 'Career Development', icon: '🚀' },
].map((c, i) => ({ ...c, color: COLORS[i % COLORS.length] }));

function NavCategories({ selected, onSelect }) {
  const trackRef = useRef(null);

  const scroll = (dir) => {
    if (trackRef.current) {
      trackRef.current.scrollBy({ left: dir * 220, behavior: 'smooth' });
    }
  };

  const handleClick = (category) => {
    onSelect(selected === category ? null : category);
  };

  return (
    <div className="nav-cats">
      <button className="nav-cats__arrow nav-cats__arrow--left" onClick={() => scroll(-1)} aria-label="Scroll left">&#8249;</button>

      <div className="nav-cats__track" ref={trackRef}>
        {CATEGORIES.map(({ label, icon, color, category }) => (
          <button
            type="button"
            className={`nav-cats__item${selected === category ? ' active' : ''}`}
            key={category}
            style={{ '--cat-bg': color }}
            onClick={() => handleClick(category)}
          >
            <span className="nav-cats__icon">{icon}</span>
            <span className="nav-cats__label">{label}</span>
          </button>
        ))}
      </div>

      <button className="nav-cats__arrow nav-cats__arrow--right" onClick={() => scroll(1)} aria-label="Scroll right">&#8250;</button>
    </div>
  );
}

export default NavCategories;

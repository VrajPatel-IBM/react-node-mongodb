import { useEffect, useRef, useState } from 'react';
import './Banner.css';

const INTERVAL = 4000;

function Banner({ slides }) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);

  const goTo = (idx) => {
    setCurrent((idx + slides.length) % slides.length);
  };

  const resetTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setCurrent((c) => (c + 1) % slides.length), INTERVAL);
  };

  useEffect(() => {
    timerRef.current = setInterval(() => setCurrent((c) => (c + 1) % slides.length), INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [slides.length]);

  useEffect(() => {
    setCurrent(0);
  }, [slides]);

  const handleNav = (dir) => {
    goTo(current + dir);
    resetTimer();
  };

  const handleDot = (i) => {
    goTo(i);
    resetTimer();
  };

  if (!slides || slides.length === 0) return null;

  const slide = slides[current];

  return (
    <section className="banner" style={{ '--banner-bg': slide.bg }}>
      {/* Left arrow */}
      <button className="banner__arrow banner__arrow--left" onClick={() => handleNav(-1)} aria-label="Previous">&#8249;</button>

      {/* Text */}
      <div className="banner__text">
        <p className="banner__tag">{slide.tag}</p>
        <h2 className="banner__title">{slide.title}</h2>
        <button className="banner__cta">{slide.cta} →</button>
      </div>

      {/* Image */}
      <div className="banner__image-wrap">
        <img
          key={current}
          className="banner__image"
          src={slide.img}
          alt={slide.title}
        />
      </div>

      {/* Right arrow */}
      <button className="banner__arrow banner__arrow--right" onClick={() => handleNav(1)} aria-label="Next">&#8250;</button>

      {/* Dots */}
      <div className="banner__dots">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`banner__dot${i === current ? ' active' : ''}`}
            onClick={() => handleDot(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

export default Banner;

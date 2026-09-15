import { useState } from 'react';
import './CourseGallery.css';

function CourseGallery({ images, title }) {
  const [active, setActive] = useState(0);

  return (
    <div className="course-gallery">
      <div className="course-gallery__thumbs">
        {images.map((img, i) => (
          <button
            key={img + i}
            className={`course-gallery__thumb${i === active ? ' active' : ''}`}
            onClick={() => setActive(i)}
            aria-label={`View image ${i + 1}`}
          >
            <img src={img} alt={`${title} thumbnail ${i + 1}`} />
          </button>
        ))}
      </div>

      <div className="course-gallery__main">
        <img src={images[active]} alt={title} />
      </div>
    </div>
  );
}

export default CourseGallery;

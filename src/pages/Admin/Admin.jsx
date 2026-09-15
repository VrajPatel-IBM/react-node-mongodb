import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadCustomCourses, selectCustomCourses } from '../../store/courses/coursesSlice';
import { adminCreateCourse, adminDeleteCourse } from '../../utils/fetchClient';
import './Admin.css';

const CATEGORIES = [
  'programming',
  'data-ai',
  'design',
  'business',
  'marketing',
  'finance',
  'photography',
  'music',
  'fitness',
  'language',
  'writing',
  'career',
];

const CATEGORY_LABELS = {
  'data-ai': 'Data & AI',
  finance: 'Personal Finance',
  photography: 'Photography & Video',
  fitness: 'Health & Fitness',
  language: 'Language Learning',
  career: 'Career Development',
};

const formatCategory = (cat) => CATEGORY_LABELS[cat] || cat.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const EMPTY_FORM = {
  title: '',
  description: '',
  category: 'programming',
  skillLevel: 'Beginner',
  price: '',
  rating: '4.8',
  seatsTotal: '100',
  instructor: '',
  thumbnail: '',
  images: [],
};

const MAX_THUMBNAIL_BYTES = 3 * 1024 * 1024;

function Admin() {
  const dispatch = useDispatch();
  const customCourses = useSelector(selectCustomCourses);

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [fileInputKey, setFileInputKey] = useState(0);
  const [galleryInputKey, setGalleryInputKey] = useState(0);

  useEffect(() => {
    dispatch(loadCustomCourses());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleThumbnailFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatus({ type: 'error', message: 'Thumbnail must be an image file.' });
      setFileInputKey((k) => k + 1);
      return;
    }

    if (file.size > MAX_THUMBNAIL_BYTES) {
      setStatus({ type: 'error', message: 'Thumbnail image must be 3MB or smaller.' });
      setFileInputKey((k) => k + 1);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, thumbnail: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const readAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleGalleryFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (files.some((f) => !f.type.startsWith('image/'))) {
      setStatus({ type: 'error', message: 'Gallery uploads must be image files.' });
      setGalleryInputKey((k) => k + 1);
      return;
    }

    if (files.some((f) => f.size > MAX_THUMBNAIL_BYTES)) {
      setStatus({ type: 'error', message: 'Each gallery image must be 3MB or smaller.' });
      setGalleryInputKey((k) => k + 1);
      return;
    }

    Promise.all(files.map(readAsDataUrl)).then((dataUris) => {
      setFormData((prev) => ({ ...prev, images: dataUris }));
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    if (!formData.title || !formData.price || !formData.category) {
      setStatus({ type: 'error', message: 'Please provide Title, Category, and Price.' });
      return;
    }

    if (!formData.thumbnail) {
      setStatus({ type: 'error', message: 'Please upload a thumbnail image.' });
      return;
    }

    setLoading(true);

    try {
      const { course } = await adminCreateCourse(formData);
      setFormData(EMPTY_FORM);
      setFileInputKey((k) => k + 1);
      setGalleryInputKey((k) => k + 1);
      await dispatch(loadCustomCourses());
      setStatus({ type: 'success', message: `Course "${course.title}" added successfully!` });
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;

    try {
      await adminDeleteCourse(id);
      await dispatch(loadCustomCourses());
    } catch (err) {
      alert('Failed to delete course');
    }
  };

  return (
    <main className="admin-page">
      <div className="admin-header">
        <h1>Admin Course Manager</h1>
        <p>Add new courses to LearnHub — image URLs, priced instantly, live on the site.</p>
      </div>

      <div className="admin-grid">
        <div className="admin-card">
          <h2>Add New Course</h2>

          {status.message && (
            <div className={`admin-alert ${status.type}`}>
              {status.message}
            </div>
          )}

          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Course Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Advanced React Patterns"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category *</label>
                <select name="category" value={formData.category} onChange={handleChange}>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {formatCategory(cat)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Skill Level</label>
                <select name="skillLevel" value={formData.skillLevel} onChange={handleChange}>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Instructor</label>
              <input
                type="text"
                name="instructor"
                value={formData.instructor}
                onChange={handleChange}
                placeholder="e.g. Priya Sharma"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Price ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="49.99"
                  required
                />
              </div>

              <div className="form-group">
                <label>Total Seats</label>
                <input
                  type="number"
                  name="seatsTotal"
                  value={formData.seatsTotal}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Rating (1 to 5)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  name="rating"
                  value={formData.rating}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide a detailed description of the course..."
              />
            </div>

            <div className="form-group">
              <label>Thumbnail Image *</label>
              <input
                key={fileInputKey}
                type="file"
                accept="image/*"
                onChange={handleThumbnailFile}
              />
              {formData.thumbnail && (
                <div className="file-preview">
                  <img src={formData.thumbnail} alt="Thumbnail preview" />
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Gallery Images</label>
              <input
                key={galleryInputKey}
                type="file"
                accept="image/*"
                multiple
                onChange={handleGalleryFiles}
              />
              {formData.images.length > 0 && (
                <div className="file-preview">
                  {formData.images.map((src, i) => (
                    <img key={i} src={src} alt={`Gallery preview ${i + 1}`} />
                  ))}
                </div>
              )}
            </div>

            <button type="submit" className="admin-submit-btn" disabled={loading}>
              {loading ? 'Saving...' : 'Save Course'}
            </button>
          </form>
        </div>

        <div className="admin-card">
          <h2>Your Custom Courses ({customCourses.length})</h2>
          <p className="admin-card-hint">
            These courses are stored in MongoDB and always appear on the homepage.
          </p>

          <div className="admin-products-list">
            {customCourses.length === 0 ? (
              <p className="admin-empty-note">No custom courses found in database. Add one on the left!</p>
            ) : (
              customCourses.map((c) => (
                <div key={c.id} className="admin-product-item">
                  <div className="admin-product-info">
                    <img src={c.thumbnail} alt={c.title} className="admin-product-thumb" />
                    <div>
                      <h4 className="admin-product-title">{c.title}</h4>
                      <p className="admin-product-meta">
                        ${Number(c.price).toFixed(2)} · {formatCategory(c.category)} · Seats: {c.seatsTotal}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="admin-delete-btn"
                    onClick={() => handleDelete(c.id)}
                    title="Delete course from database"
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default Admin;

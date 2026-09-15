import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCartItemCount } from '../../store/cart/cartSlice';
import { selectAuthUser } from '../../store/auth/authSlice';
import { searchCourses } from '../../utils/fetchClient';
import './Header.css';

const MIN_QUERY_LENGTH = 3;

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const totalCount = useSelector(selectCartItemCount);
  const user = useSelector(selectAuthUser);
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [resultsOpen, setResultsOpen] = useState(false);
  const searchRef = useRef(null);

  const trimmedQuery = query.trim();

  useEffect(() => {
    if (trimmedQuery.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    const timer = setTimeout(() => {
      searchCourses(trimmedQuery)
        .then((courses) => setResults(courses))
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [trimmedQuery]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setResultsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (id) => {
    setQuery('');
    setResults([]);
    setResultsOpen(false);
    navigate(`/course/${id}`);
  };

  const handleKeyDown = (e) => {
    if (e.key !== 'Enter' || trimmedQuery.length < MIN_QUERY_LENGTH) return;
    setResultsOpen(false);
    navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
  };

  const showDropdown = resultsOpen && trimmedQuery.length > 0;

  return (
    <header className="header">
      <div className="header__logo">
        <Link to="/">
          <span className="header__logo-icon">🎓</span>
          <span className="header__logo-text">Learn<span className="header__logo-accent">Hub</span></span>
        </Link>
      </div>

      <button
        className={`header__burger${menuOpen ? ' open' : ''}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <span /><span /><span />
      </button>

      <nav className={`header__nav${menuOpen ? ' open' : ''}`}>
        <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
        <Link to="/?category=programming" onClick={() => setMenuOpen(false)}>Programming</Link>
        <Link to="/?category=data-ai" onClick={() => setMenuOpen(false)}>Data &amp; AI</Link>
        <Link to="/?category=business" onClick={() => setMenuOpen(false)}>Business</Link>
        <Link to="/?category=design" onClick={() => setMenuOpen(false)}>Design</Link>
        <Link to="/track-enrollment" onClick={() => setMenuOpen(false)}>Track Enrollment</Link>
        <Link to="/admin" onClick={() => setMenuOpen(false)} style={{ color: '#a5b4fc', fontWeight: 600 }}>+ Add Course</Link>
      </nav>

      <div className="header__actions">
        <div className="header__search-wrap" ref={searchRef}>
          <input
            className="header__search"
            type="text"
            placeholder="Search for courses..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setResultsOpen(true)}
            onKeyDown={handleKeyDown}
          />

          {showDropdown && (
            <div className="header__search-results">
              {trimmedQuery.length < MIN_QUERY_LENGTH ? (
                <p className="header__search-status">Type at least {MIN_QUERY_LENGTH} characters to search.</p>
              ) : searching ? (
                <p className="header__search-status">Searching…</p>
              ) : results.length === 0 ? (
                <p className="header__search-status">No courses found.</p>
              ) : (
                results.map((course) => (
                  <button
                    key={course.id}
                    type="button"
                    className="header__search-result"
                    onClick={() => handleResultClick(course.id)}
                  >
                    <img src={course.thumbnail} alt={course.title} />
                    <span className="header__search-result-body">
                      <span className="header__search-result-title">{course.title}</span>
                      <span className="header__search-result-price">${Number(course.price).toFixed(2)}</span>
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <Link
          to={user ? '/account' : '/login'}
          className="header__icon-link"
          title={user ? user.name : 'Account'}
        >
          <span className="header__icon">👤</span>
          {user && <span className="header__account-name">{user.name.split(' ')[0]}</span>}
        </Link>
        <span className="header__icon" title="Wishlist">♡</span>
        <Link to="/cart" className="header__icon-link" title="Cart">
          <span className="header__icon">🛒</span>
          {totalCount > 0 && <span className="header__badge">{totalCount}</span>}
        </Link>
      </div>
    </header>
  );
}

export default Header;

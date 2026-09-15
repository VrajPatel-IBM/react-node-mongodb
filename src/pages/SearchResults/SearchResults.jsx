import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import CourseCard from '../../components/CourseCard/CourseCard';
import {
  searchCoursesThunk,
  selectSearchResults,
  selectSearchLoading,
  selectSearchError,
} from '../../store/courses/coursesSlice';
import './SearchResults.css';

function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = (searchParams.get('q') || '').trim();
  const dispatch = useDispatch();

  const courses = useSelector(selectSearchResults);
  const loading = useSelector(selectSearchLoading);
  const error = useSelector(selectSearchError);

  useEffect(() => {
    dispatch(searchCoursesThunk(query));
  }, [query, dispatch]);

  return (
    <main className="search-results">
      <h1 className="search-results__heading">
        {query ? `Search results for "${query}"` : 'Search'}
      </h1>

      {!loading && !error && (
        <p className="search-results__count">
          {courses.length} {courses.length === 1 ? 'course' : 'courses'} found
        </p>
      )}

      {loading && <p className="search-results__status">Searching...</p>}
      {error && <p className="search-results__status search-results__status--error">{error}</p>}

      {!loading && !error && courses.length === 0 && query && (
        <p className="search-results__status">No courses match "{query}". Try a different search.</p>
      )}

      {!loading && !error && courses.length > 0 && (
        <div className="search-results__grid">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </main>
  );
}

export default SearchResults;

import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CourseCard from '../CourseCard/CourseCard';
import {
  fetchCoursesList,
  selectCourses,
  selectCoursesTotal,
  selectCoursesLoading,
  selectCoursesLoadingMore,
  selectCoursesError,
  selectCoursesMoreError,
} from '../../store/courses/coursesSlice';
import './CourseList.css';

const PAGE_SIZE = 12;

const CATEGORY_LABELS = {
  programming: 'Programming',
  'data-ai': 'Data & AI',
  design: 'Design',
  business: 'Business',
  marketing: 'Marketing',
  finance: 'Personal Finance',
  photography: 'Photography & Video',
  music: 'Music',
  fitness: 'Health & Fitness',
  language: 'Language Learning',
  writing: 'Writing',
  career: 'Career Development',
};

function formatHeading(category) {
  if (!category) return 'Popular Courses';
  return CATEGORY_LABELS[category] || category.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function CourseList({ category }) {
  const dispatch = useDispatch();
  const courses = useSelector(selectCourses);
  const total = useSelector(selectCoursesTotal);
  const loading = useSelector(selectCoursesLoading);
  const loadingMore = useSelector(selectCoursesLoadingMore);
  const error = useSelector(selectCoursesError);
  const moreError = useSelector(selectCoursesMoreError);

  const sentinelRef = useRef(null);
  const [triggerMore, setTriggerMore] = useState(false);

  useEffect(() => {
    dispatch(fetchCoursesList(category, 0, PAGE_SIZE));
  }, [category, dispatch]);

  const hasMore = total === null || courses.length < total;

  useEffect(() => {
    if (loading || error || moreError || loadingMore || !hasMore) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setTriggerMore(true);
        }
      },
      { rootMargin: '300px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loading, error, moreError, loadingMore, hasMore]);

  useEffect(() => {
    if (!triggerMore) return;
    setTriggerMore(false);
    dispatch(fetchCoursesList(category, courses.length, PAGE_SIZE));
  }, [triggerMore, category, courses.length, dispatch]);

  const handleRetryLoadMore = () => {
    dispatch(fetchCoursesList(category, courses.length, PAGE_SIZE));
  };

  return (
    <section className="course-list">
      <h2 className="course-list__heading">{formatHeading(category)}</h2>

      {loading && <p>Loading courses...</p>}
      {error && <p className="course-list__error">{error}</p>}

      <div className="course-list__grid">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      {!loading && !error && !moreError && hasMore && <div ref={sentinelRef} className="course-list__sentinel" />}
      {loadingMore && <p className="course-list__loading-more">Loading more courses...</p>}
      {moreError && (
        <div className="course-list__more-error">
          <p>{moreError}</p>
          <button type="button" onClick={handleRetryLoadMore}>Retry</button>
        </div>
      )}
      {!loading && !error && !hasMore && courses.length > 0 && (
        <p className="course-list__end">You've seen all courses.</p>
      )}
      {!loading && !error && courses.length === 0 && (
        <p className="course-list__end">No courses found in this category.</p>
      )}
    </section>
  );
}

export default CourseList;

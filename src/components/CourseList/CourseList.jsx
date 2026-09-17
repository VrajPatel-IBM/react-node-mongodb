import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CourseCard from '../CourseCard/CourseCard';
import Pagination from '../Pagination/Pagination';
import {
  fetchCoursesList,
  selectCourses,
  selectCoursesTotal,
  selectCoursesLoading,
  selectCoursesError,
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
  const error = useSelector(selectCoursesError);

  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchCoursesList(category, (page - 1) * PAGE_SIZE, PAGE_SIZE));
  }, [category, page, dispatch]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

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

      {!loading && !error && courses.length === 0 && (
        <p className="course-list__end">No courses found in this category.</p>
      )}

      {!loading && !error && total > 0 && (
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      )}
    </section>
  );
}

export default CourseList;

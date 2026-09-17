import { useDispatch, useSelector } from 'react-redux';
import Banner from '../../components/Banner/Banner';
import NavCategories from '../../components/NavCategories/NavCategories';
import CourseList from '../../components/CourseList/CourseList';
import { setCategory, selectCategory } from '../../store/courses/coursesSlice';

const BANNER_SLIDES = [
  {
    tag: 'Learn to Code',
    title: 'Build Real Skills in Programming.',
    cta: 'Explore Courses',
    bg: '#eceafd',
    img: 'https://picsum.photos/seed/learnhub-code/600/600',
  },
  {
    tag: 'Data & AI',
    title: 'Master Machine Learning From Scratch.',
    cta: 'Start Learning',
    bg: '#e8f0fe',
    img: 'https://picsum.photos/seed/learnhub-data/600/600',
  },
  {
    tag: 'Design Careers',
    title: 'Become a Confident UI/UX Designer.',
    cta: 'View Design Courses',
    bg: '#fce8f3',
    img: 'https://picsum.photos/seed/learnhub-design/600/600',
  },
  {
    tag: 'Live Cohorts',
    title: 'Learn Together, Ship Faster.',
    cta: 'Join a Cohort',
    bg: '#fff3e0',
    img: 'https://picsum.photos/seed/learnhub-cohort/600/600',
  },
  {
    tag: 'Grow Your Career',
    title: 'Skills That Get You Hired.',
    cta: 'Shop Career Courses',
    bg: '#f3e8ff',
    img: 'https://picsum.photos/seed/learnhub-career/600/600',
  },
  {
    tag: '1:1 Mentorship',
    title: 'Get Personal Guidance From Experts.',
    cta: 'Find a Mentor',
    bg: '#e6f4ea',
    img: 'https://picsum.photos/seed/learnhub-mentor/600/600',
  },
];

function Home() {
  const dispatch = useDispatch();
  const category = useSelector(selectCategory);

  const handleSelectCategory = (cat) => {
    dispatch(setCategory(cat));
  };

  return (
    <main>
      <NavCategories selected={category} onSelect={handleSelectCategory} />
      <Banner slides={BANNER_SLIDES} />
      <CourseList key={category ?? 'all'} category={category} />
    </main>
  );
}

export default Home;

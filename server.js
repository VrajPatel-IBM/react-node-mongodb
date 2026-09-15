/**
 * LearnHub REST API server
 * -------------------------
 * This single file is the whole backend: it connects to MongoDB (via Mongoose),
 * defines the data models (Course, User, Enrollment), and exposes them as a
 * REST API under the `/api` path so the React frontend can read/create/update/
 * delete data over plain HTTP + JSON.
 *
 * REST ideas demonstrated in this file:
 *  - Resources are nouns in the URL (/api/courses, /api/enrollments, ...) —
 *    the HTTP method is what says what action to take, not the URL.
 *  - GET    = read (a list, or one resource by id)
 *  - POST   = create a new resource
 *  - PUT    = update/replace an existing resource
 *  - DELETE = remove a resource
 *  - Every request/response body is JSON, and the API is stateless — no
 *    server-side session; each request carries everything needed to handle it.
 *  - Meaningful HTTP status codes are returned: 200 (OK), 400 (bad request),
 *    401 (unauthorized), 404 (not found), 409 (conflict).
 */
require('dotenv').config();

const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ---------------------------------------------------------------------------
// Models
// ---------------------------------------------------------------------------
// Each Mongoose Schema defines the shape of documents in one MongoDB
// collection: Course -> "courses", User -> "users", Enrollment -> "enrollments".
// mongoose.model(...) compiles a schema into a model — the object actually used
// below to find/create/update/delete documents in that collection.
//
// toClient() on each model is a small serializer: it reshapes/filters the raw
// MongoDB document into exactly what the frontend should receive (e.g. it
// leaves passwordHash out of the User response entirely).

const priceTierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    skillLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
    description: { type: String, default: '' },
    longDescription: { type: String, default: '' },
    instructor: { type: String, default: '' },
    thumbnail: { type: String, default: '' },
    images: { type: [String], default: [] },
    priceTiers: { type: [priceTierSchema], default: [] },
    rating: { type: Number, default: 4.5 },
    seatsTotal: { type: Number, default: 100 },
    seatsEnrolled: { type: Number, default: 0 },
    syllabus: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    isCustom: { type: Boolean, default: false },
  },
  { timestamps: true }
);

courseSchema.methods.toClient = function toClient() {
  return {
    id: String(this._id),
    title: this.title,
    slug: this.slug,
    category: this.category,
    skillLevel: this.skillLevel,
    description: this.description,
    longDescription: this.longDescription,
    instructor: this.instructor,
    thumbnail: this.thumbnail,
    images: this.images,
    priceTiers: this.priceTiers.map((tier) => ({ name: tier.name, price: tier.price })),
    price: this.priceTiers?.[0]?.price ?? 0,
    rating: this.rating,
    seatsTotal: this.seatsTotal,
    seatsEnrolled: this.seatsEnrolled,
    seatsRemaining: Math.max(this.seatsTotal - this.seatsEnrolled, 0),
    syllabus: this.syllabus,
    tags: this.tags,
    isCustom: this.isCustom,
  };
};

const Course = mongoose.model('Course', courseSchema);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    mobile: { type: String, required: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

userSchema.methods.toClient = function toClient() {
  return {
    id: String(this._id),
    name: this.name,
    email: this.email,
    mobile: this.mobile,
  };
};

const User = mongoose.model('User', userSchema);

const enrollmentItemSchema = new mongoose.Schema(
  {
    courseId: { type: String, required: true },
    title: { type: String, required: true },
    tier: { type: String, default: '' },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    thumbnail: { type: String, default: '' },
  },
  { _id: false }
);

const enrollmentSchema = new mongoose.Schema(
  {
    enrollmentNumber: { type: String, required: true, unique: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true, lowercase: true },
    items: { type: [enrollmentItemSchema], default: [] },
    subtotal: { type: Number, required: true },
    platformFee: { type: Number, required: true },
    supportFee: { type: Number, required: true },
    total: { type: Number, required: true },
    paymentMethod: { type: String, default: 'card' },
    billingAddress: {
      line1: String,
      city: String,
      state: String,
      zip: String,
      country: String,
    },
    cohortPreference: { type: String, default: 'self-paced' },
    placedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

enrollmentSchema.methods.toClient = function toClient() {
  return {
    id: String(this._id),
    enrollmentNumber: this.enrollmentNumber,
    userName: this.userName,
    userEmail: this.userEmail,
    items: this.items.map((item) => ({
      courseId: item.courseId,
      title: item.title,
      tier: item.tier,
      price: item.price,
      quantity: item.quantity,
      thumbnail: item.thumbnail,
    })),
    subtotal: this.subtotal,
    platformFee: this.platformFee,
    supportFee: this.supportFee,
    total: this.total,
    paymentMethod: this.paymentMethod,
    billingAddress: this.billingAddress ? this.billingAddress.toObject() : this.billingAddress,
    cohortPreference: this.cohortPreference,
    placedAt: this.placedAt,
  };
};

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

const CATEGORIES = [
  { slug: 'programming', label: 'Programming', icon: '💻' },
  { slug: 'data-ai', label: 'Data & AI', icon: '📊' },
  { slug: 'design', label: 'Design', icon: '🎨' },
  { slug: 'business', label: 'Business', icon: '💼' },
  { slug: 'marketing', label: 'Marketing', icon: '📣' },
  { slug: 'finance', label: 'Personal Finance', icon: '💰' },
  { slug: 'photography', label: 'Photography & Video', icon: '📷' },
  { slug: 'music', label: 'Music', icon: '🎵' },
  { slug: 'fitness', label: 'Health & Fitness', icon: '🧘' },
  { slug: 'language', label: 'Language Learning', icon: '🗣️' },
  { slug: 'writing', label: 'Writing', icon: '✍️' },
  { slug: 'career', label: 'Career Development', icon: '🚀' },
];

function tiers(base) {
  return [
    { name: 'Self-Paced', price: base },
    { name: 'Live Cohort', price: Math.round((base + 40) * 100) / 100 },
    { name: '1:1 Mentorship', price: Math.round((base + 120) * 100) / 100 },
  ];
}

function img(seed, n) {
  return `https://picsum.photos/seed/${seed}${n}/800/500`;
}

const RAW_COURSES = [
  { title: 'JavaScript Fundamentals', category: 'programming', level: 'Beginner', instructor: 'Maya Chen', price: 39, seats: 20 },
  { title: 'React from Scratch', category: 'programming', level: 'Intermediate', instructor: 'Daniel Osei', price: 59, seats: 15 },
  { title: 'Backend Engineering with Node.js', category: 'programming', level: 'Advanced', instructor: 'Priya Nair', price: 69, seats: 12 },
  { title: 'Python for Everybody', category: 'programming', level: 'Beginner', instructor: 'Tom Reyes', price: 35, seats: 25 },

  { title: 'Machine Learning Foundations', category: 'data-ai', level: 'Intermediate', instructor: 'Dr. Aisha Bello', price: 79, seats: 10 },
  { title: 'Data Analysis with SQL', category: 'data-ai', level: 'Beginner', instructor: 'Leo Fischer', price: 45, seats: 20 },
  { title: 'Deep Learning with PyTorch', category: 'data-ai', level: 'Advanced', instructor: 'Dr. Aisha Bello', price: 89, seats: 8 },

  { title: 'UI/UX Design Principles', category: 'design', level: 'Beginner', instructor: 'Sofia Alvarez', price: 42, seats: 18 },
  { title: 'Advanced Figma Prototyping', category: 'design', level: 'Intermediate', instructor: 'Noah Kim', price: 55, seats: 14 },
  { title: 'Design Systems at Scale', category: 'design', level: 'Advanced', instructor: 'Sofia Alvarez', price: 65, seats: 10 },

  { title: 'Startup Fundamentals', category: 'business', level: 'Beginner', instructor: 'Ethan Brooks', price: 49, seats: 20 },
  { title: 'Product Management Bootcamp', category: 'business', level: 'Intermediate', instructor: 'Grace Liu', price: 72, seats: 15 },
  { title: 'Negotiation & Leadership', category: 'business', level: 'Intermediate', instructor: 'Ethan Brooks', price: 58, seats: 16 },

  { title: 'Digital Marketing Essentials', category: 'marketing', level: 'Beginner', instructor: 'Chloe Martin', price: 38, seats: 22 },
  { title: 'SEO & Content Strategy', category: 'marketing', level: 'Intermediate', instructor: 'Ravi Shah', price: 47, seats: 18 },
  { title: 'Growth Hacking for Startups', category: 'marketing', level: 'Advanced', instructor: 'Chloe Martin', price: 64, seats: 12 },

  { title: 'Personal Budgeting Mastery', category: 'finance', level: 'Beginner', instructor: 'Isabel Cruz', price: 29, seats: 25 },
  { title: 'Investing for Beginners', category: 'finance', level: 'Beginner', instructor: 'Marcus Webb', price: 44, seats: 20 },
  { title: 'Real Estate Investing 101', category: 'finance', level: 'Intermediate', instructor: 'Marcus Webb', price: 68, seats: 14 },

  { title: 'Photography Fundamentals', category: 'photography', level: 'Beginner', instructor: 'Yuki Tanaka', price: 36, seats: 20 },
  { title: 'Cinematic Video Editing', category: 'photography', level: 'Intermediate', instructor: 'Omar Farouk', price: 54, seats: 15 },
  { title: 'Portrait Lighting Masterclass', category: 'photography', level: 'Advanced', instructor: 'Yuki Tanaka', price: 71, seats: 10 },

  { title: 'Music Theory Basics', category: 'music', level: 'Beginner', instructor: 'Elena Petrova', price: 32, seats: 20 },
  { title: 'Music Production with Ableton', category: 'music', level: 'Intermediate', instructor: 'Jamal Carter', price: 58, seats: 14 },

  { title: 'Beginner Yoga & Mobility', category: 'fitness', level: 'Beginner', instructor: 'Nadia Hassan', price: 25, seats: 30 },
  { title: 'Strength Training Fundamentals', category: 'fitness', level: 'Beginner', instructor: 'Jake Turner', price: 34, seats: 25 },
  { title: 'Nutrition & Meal Planning', category: 'fitness', level: 'Intermediate', instructor: 'Nadia Hassan', price: 41, seats: 20 },

  { title: 'Conversational Spanish', category: 'language', level: 'Beginner', instructor: 'Carmen Diaz', price: 33, seats: 22 },
  { title: 'Business English Fluency', category: 'language', level: 'Intermediate', instructor: 'Hana Suzuki', price: 45, seats: 18 },

  { title: 'Creative Writing Workshop', category: 'writing', level: 'Beginner', instructor: 'Oliver Bennett', price: 30, seats: 20 },
  { title: 'Copywriting that Converts', category: 'writing', level: 'Intermediate', instructor: 'Oliver Bennett', price: 46, seats: 16 },

  { title: 'Resume & Interview Mastery', category: 'career', level: 'Beginner', instructor: 'Fatima Al-Sayed', price: 28, seats: 30 },
  { title: 'Freelancing to Full-Time', category: 'career', level: 'Intermediate', instructor: 'Fatima Al-Sayed', price: 39, seats: 20 },
];

function toSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function toCustomSlug(title) {
  return `${toSlug(title)}-${Date.now()}`;
}

function buildCourseDocs() {
  return RAW_COURSES.map((c) => {
    const slug = toSlug(c.title);
    return {
      title: c.title,
      slug,
      category: c.category,
      skillLevel: c.level,
      description: `${c.title} taught by ${c.instructor}. A hands-on course designed to take you from ${c.level.toLowerCase()} concepts to real-world confidence.`,
      longDescription:
        `This course covers everything you need to know about ${c.title.toLowerCase()}, ` +
        `combining video lessons, hands-on projects, and instructor feedback. ` +
        `By the end, you'll have a portfolio-ready project and a clear path to the next skill level.`,
      instructor: c.instructor,
      thumbnail: img(slug, 0),
      images: [img(slug, 1), img(slug, 2), img(slug, 3)],
      priceTiers: tiers(c.price),
      rating: Math.round((4 + Math.random()) * 10) / 10,
      seatsTotal: c.seats,
      seatsEnrolled: Math.floor(Math.random() * c.seats * 0.4),
      syllabus: [
        'Module 1: Getting Started',
        'Module 2: Core Concepts',
        'Module 3: Hands-on Project',
        'Module 4: Advanced Techniques',
        'Module 5: Capstone & Certification',
      ],
      tags: [c.category, c.level.toLowerCase()],
      isCustom: false,
    };
  });
}

async function seedIfEmpty() {
  const count = await Course.countDocuments();
  if (count > 0) return;
  await Course.insertMany(buildCourseDocs());
  console.log(`Seeded ${RAW_COURSES.length} courses`);
}

// ---------------------------------------------------------------------------
// Express app + data routes
// ---------------------------------------------------------------------------

// Opens the connection to MongoDB Atlas using the connection string from .env.
// mongoose.connect() is the driver-level equivalent of a SQL client's connect() —
// every query below (find/create/update/delete) runs over this one connection.
async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set. Copy .env.example to .env and fill it in.');
  }
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log('MongoDB connected');
}

async function main() {
  await connectDB();
  await seedIfEmpty();

  const app = express();
  // Needed to parse incoming JSON request bodies into req.body — without this,
  // req.body would be undefined on every POST/PUT below.
  app.use(express.json({ limit: '25mb' }));

  // All REST endpoints are grouped on one Router and mounted at /api further
  // down, so every path below is really /api/<path>, e.g. /api/courses.
  const data = express.Router();

  // ---- Courses resource: read-only through the public API (GET only) -----

  // GET /api/categories — read a small static reference list (not a Mongo
  // collection at all, just an in-memory array used to populate dropdowns/nav).
  data.get('/categories', (req, res) => {
    res.json({ categories: CATEGORIES });
  });

  // GET /api/courses/search?q=... — read, filtered by a case-insensitive
  // title match. Query params (?q=) are the REST-y way to pass search/filter
  // criteria for a GET, since GET requests don't have a body.
  data.get('/courses/search', async (req, res) => {
    const q = (req.query.q || '').trim();
    if (!q) return res.json({ courses: [] });
    const regex = new RegExp(q, 'i');
    const docs = await Course.find({ title: regex }).limit(20);
    res.json({ courses: docs.map((d) => d.toClient()) });
  });

  // GET /api/courses — read the whole courses collection, with pagination
  // (skip/limit) and an optional category filter, again via query params.
  data.get('/courses', async (req, res) => {
    const { category, skip = 0, limit = 12 } = req.query;
    const filter = category ? { category } : {};
    const skipNum = Number(skip) || 0;
    const limitNum = Number(limit) || 12;

    const [docs, total] = await Promise.all([
      Course.find(filter).sort({ createdAt: -1 }).skip(skipNum).limit(limitNum),
      Course.countDocuments(filter),
    ]);

    res.json({
      courses: docs.map((d) => d.toClient()),
      total,
      skip: skipNum,
      limit: limitNum,
    });
  });

  // GET /api/courses/:id — read a single resource, identified by either its
  // Mongo _id or its slug in the URL path (the REST convention for "one
  // specific item" is /collection/:id, as opposed to a query param for GET-all).
  data.get('/courses/:id', async (req, res) => {
    const { id } = req.params;
    const query = mongoose.isValidObjectId(id) ? { _id: id } : { slug: id };
    const course = await Course.findOne(query);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const related = await Course.find({
      category: course.category,
      _id: { $ne: course._id },
    }).limit(4);

    res.json({
      course: course.toClient(),
      related: related.map((d) => d.toClient()),
    });
  });

  // ---- Auth: not pure REST "resources", but still modeled the same way ----
  // There's no session/JWT/cookie here — login/signup just check credentials
  // and hand back the user record; the frontend (Redux) decides what "logged
  // in" means client-side. A production app would issue a token/session here.

  // POST /api/auth/signup — create a new User resource. Passwords are never
  // stored as plain text: bcrypt.hash() one-way hashes it before saving.
  // 409 Conflict if that email is already registered (a real REST status code
  // for "this would collide with an existing resource").
  data.post('/auth/signup', async (req, res) => {
    const { name, email, mobile, password } = req.body;
    if (!name || !email || !mobile || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, mobile, passwordHash });
    res.json({ user: user.toClient() });
  });

  // POST /api/auth/login — not really "creating" anything; it's a credential
  // check (bcrypt.compare verifies the password against the stored hash).
  // 401 Unauthorized on a bad email/password, without revealing which one was wrong.
  data.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json({ user: user.toClient() });
  });

  // PUT /api/auth/profile/:id — update an existing User resource by id.
  // PUT is the REST verb for "update an existing thing you already know the
  // id of" (as opposed to POST, which creates a new one).
  data.put('/auth/profile/:id', async (req, res) => {
    const { name, mobile } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { ...(name && { name }), ...(mobile && { mobile }) } },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: user.toClient() });
  });

  // ---- Enrollments resource: an order / checkout record --------------------

  // POST /api/enrollments — create a new Enrollment ("place an order").
  // The server generates the public-facing enrollmentNumber itself (never
  // trusts one from the client) and retries a few times on the rare chance
  // it collides with the schema's unique index, instead of failing the order.
  data.post('/enrollments', async (req, res) => {
    const { enrollmentNumber, ...body } = req.body;

    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const digits = Math.floor(10000000 + Math.random() * 90000000);
        const enrollment = await Enrollment.create({ ...body, enrollmentNumber: `ENR${digits}` });
        return res.json({ enrollment: enrollment.toClient() });
      } catch (err) {
        if (err.code === 11000 && attempt < 4) continue;
        return res.status(400).json({ error: err.message || 'Unable to create enrollment' });
      }
    }
  });

  // GET /api/enrollments/:enrollmentNumber — read one order by its
  // human-friendly order number instead of its Mongo _id (used by the
  // "Track my order" page, which works without logging in). 404 if it
  // doesn't exist — the standard REST status for "no such resource".
  data.get('/enrollments/:enrollmentNumber', async (req, res) => {
    const enrollment = await Enrollment.findOne({ enrollmentNumber: req.params.enrollmentNumber });
    if (!enrollment) return res.status(404).json({ error: 'Enrollment not found' });
    res.json({ enrollment: enrollment.toClient() });
  });

  // GET /api/enrollments?email=... — read every order placed by one email
  // (used by the logged-in Account page's order history).
  data.get('/enrollments', async (req, res) => {
    const { email } = req.query;
    if (!email) return res.json({ enrollments: [] });
    const docs = await Enrollment.find({ userEmail: email.toLowerCase() }).sort({ placedAt: -1 });
    res.json({ enrollments: docs.map((d) => d.toClient()) });
  });

  // ---- Admin courses: the one resource with full CRUD exposed --------------
  // Create (POST), Read (GET), and Delete (DELETE) are all here — there's no
  // PUT/PATCH yet, so an admin course can't be edited after creation, only
  // added or removed. That'd be the natural "what's missing" to call out.

  // GET /api/admin/courses — read only the custom (admin-added) courses,
  // not the full catalog.
  data.get('/admin/courses', async (req, res) => {
    const docs = await Course.find({ isCustom: true }).sort({ createdAt: -1 });
    res.json({ courses: docs.map((d) => d.toClient()) });
  });

  // POST /api/admin/courses — create a new custom Course resource from the
  // admin "Add Course" form.
  data.post('/admin/courses', async (req, res) => {
    try {
      const {
        title,
        category,
        skillLevel,
        description,
        instructor,
        thumbnail,
        images,
        price,
        seatsTotal,
        rating,
      } = req.body;

      if (!title || !category || !price) {
        return res.status(400).json({ error: 'Title, category, and price are required' });
      }

      const course = await Course.create({
        title,
        slug: toCustomSlug(title),
        category,
        skillLevel: skillLevel || 'Beginner',
        description: description || '',
        longDescription: description || '',
        instructor: instructor || 'LearnHub Instructor',
        thumbnail: thumbnail || '',
        images: Array.isArray(images)
          ? images.filter(Boolean)
          : (images || '')
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean),
        priceTiers: [{ name: 'Self-Paced', price: Number(price) }],
        rating: Number(rating) || 4.5,
        seatsTotal: Number(seatsTotal) || 50,
        seatsEnrolled: 0,
        syllabus: ['Module 1: Getting Started', 'Module 2: Core Concepts', 'Module 3: Capstone Project'],
        tags: [category],
        isCustom: true,
      });

      res.json({ course: course.toClient() });
    } catch (err) {
      res.status(400).json({ error: err.message || 'Unable to create course' });
    }
  });

  // DELETE /api/admin/courses/:id — remove a custom Course resource by id.
  // (Scoped to isCustom: true so this can never delete one of the seeded
  // catalog courses.)
  data.delete('/admin/courses/:id', async (req, res) => {
    const deleted = await Course.findOneAndDelete({ _id: req.params.id, isCustom: true });
    if (!deleted) return res.status(404).json({ error: 'Course not found' });
    res.json({ success: true });
  });

  // This is the line that makes every route above actually live under
  // /api/... — the router is just a list of routes until it's mounted here.
  app.use('/api', data);

  // Everything below this line serves the React app, NOT the REST API: static
  // JS/CSS from the production build, then a catch-all that returns index.html
  // for any other route so React Router can handle client-side navigation
  // (e.g. refreshing the browser on /admin still works).
  app.use(express.static(path.join(__dirname, 'build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });

  // API_PORT (not PORT) so this doesn't collide with the CRA dev server, which
  // defaults to port 3000.
  const port = process.env.API_PORT || 5000;
  app.listen(port, () => {
    console.log(`LearnHub server running at http://localhost:${port}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});

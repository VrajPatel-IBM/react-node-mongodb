import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__perks">
        <div>🎓 Lifetime Access<br /><small>Learn at your own pace, forever</small></div>
        <div>🔁 30-Day Guarantee<br /><small>Not happy? Get a full refund</small></div>
        <div>🎧 Mentor Support<br /><small>Get help from real instructors</small></div>
        <div>📜 Certificates<br /><small>Share your achievement anywhere</small></div>
      </div>

      <div className="footer__newsletter">
        <h3>Get New Course Drops &amp; Learning Tips</h3>
        <div className="footer__newsletter-form">
          <input type="email" placeholder="Enter your email" />
          <button>Subscribe</button>
        </div>
      </div>

      <div className="footer__columns">
        <div>
          <h4>🎓 LearnHub</h4>
          <p>Practical, cohort-backed courses taught by working professionals.</p>
        </div>
        <div>
          <h4>Company</h4>
          <p>About us</p>
          <p>Careers</p>
          <p>Become an Instructor</p>
          <p>Our Blog</p>
        </div>
        <div>
          <h4>Explore</h4>
          <p>Programming</p>
          <p>Data &amp; AI</p>
          <p>Design</p>
          <p>Business</p>
        </div>
        <div>
          <h4>Support</h4>
          <p>FAQs</p>
          <p>Reviews</p>
          <p>Contact Us</p>
          <p>Track Enrollment</p>
        </div>
        <div>
          <h4>Talk To Us</h4>
          <p>+91 9313329028</p>
          <p>support@learnhub.dev</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

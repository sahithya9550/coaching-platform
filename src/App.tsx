import { useState } from 'react'
import './App.css'

const courses = [
  {
    name: 'JEE Main',
    icon: '⚡',
    description: 'Physics, Chemistry and Mathematics with personalized attention.',
    subjects: 'Physics • Chemistry • Maths',
  },
  {
    name: 'JEE Advanced',
    icon: '🎯',
    description: 'Advanced problem-solving and structured exam preparation.',
    subjects: 'Concepts • Practice • Evaluation',
  },
  {
    name: 'NEET',
    icon: '🧬',
    description: 'Expert coaching for medical entrance preparation.',
    subjects: 'Physics • Chemistry • Biology',
  },
  {
    name: 'Foundation Classes',
    icon: '📚',
    description: 'Build strong fundamentals from Classes 9 and 10.',
    subjects: 'Class 9 • Class 10',
  },
]

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    grade: '11',
    exam: 'JEE Main',
  })
  const [submitted, setSubmitted] = useState(false)

  function handleDemo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // Next phase: securely save the enquiry to Supabase.
    setSubmitted(true)
  }

  return (
    <div className="site">
      <header className="navbar">
        <a className="logo" href="#">
          <span className="logo-mark">✦</span>
          <span>Elevate<span className="brand-accent">Academy</span></span>
        </a>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          ☰
        </button>

        <nav className={menuOpen ? 'nav-links open' : 'nav-links'}>
          <a href="#home" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="#courses" onClick={() => setMenuOpen(false)}>Courses</a>
          <a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
          <a className="nav-cta" href="#demo" onClick={() => setMenuOpen(false)}>
            Book Free Demo →
          </a>
        </nav>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <span className="eyebrow">PERSONALIZED ONLINE COACHING</span>
            <h1>
              Big Dreams.
              <br />
              <span>Personalized Learning.</span>
            </h1>
            <p>
              Expert-led JEE Main, JEE Advanced and NEET coaching
              for Classes 9–12. Learn in one-to-one sessions or
              focused small groups, at your own pace.
            </p>

            <div className="hero-actions">
              <a href="#demo" className="btn btn-primary">
                Book Your Free Demo →
              </a>
              <a href="#courses" className="btn btn-outline">
                Explore Courses
              </a>
            </div>

            <div className="hero-points">
              <span>✓ One Free Demo</span>
              <span>✓ Expert Tutors</span>
              <span>✓ Personal Attention</span>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-orbit orbit-one"></div>
            <div className="hero-orbit orbit-two"></div>
            <div className="hero-center">
              <div className="hero-symbol">✦</div>
              <h3>Learn Better.</h3>
              <p>Grow Stronger.</p>
            </div>
            <div className="floating-card float-top">
              <span>📈</span>
              <div><strong>Track Progress</strong><small>Understand every improvement</small></div>
            </div>
            <div className="floating-card float-bottom">
              <span>🎓</span>
              <div><strong>Expert Guidance</strong><small>Designed around your needs</small></div>
            </div>
          </div>
        </section>

        <section className="section courses-section" id="courses">
          <div className="section-heading">
            <span className="eyebrow">OUR PROGRAMS</span>
            <h2>Find Your Path to Success</h2>
            <p>Focused coaching designed for your academic goals.</p>
          </div>

          <div className="course-grid">
            {courses.map((course) => (
              <article className="course-card" key={course.name}>
                <div className="course-icon">{course.icon}</div>
                <h3>{course.name}</h3>
                <p>{course.description}</p>
                <span className="course-subjects">{course.subjects}</span>
                <a href="#demo">Explore Program →</a>
              </article>
            ))}
          </div>
        </section>

        <section className="section benefits-section" id="about">
          <div className="section-heading">
            <span className="eyebrow">WHY CHOOSE US</span>
            <h2>More Than Just Coaching</h2>
            <p>Learning support tailored to each student's needs.</p>
          </div>
          <div className="benefit-grid">
            <div><span>👨‍🏫</span><h3>Experienced Tutors</h3><p>Subject specialists guiding every learning session.</p></div>
            <div><span>🧠</span><h3>Personalized Learning</h3><p>Plans built around your strengths and weak topics.</p></div>
            <div><span>📊</span><h3>Testing & Evaluation</h3><p>Structured assessments and actionable feedback.</p></div>
            <div><span>💻</span><h3>Learn from Anywhere</h3><p>Convenient online classes with flexible scheduling.</p></div>
          </div>
        </section>

        <section className="section pricing-section" id="pricing">
          <div className="section-heading">
            <span className="eyebrow">SIMPLE PRICING</span>
            <h2>Invest in Your Future</h2>
            <p>Transparent pricing. Start with a free demo class.</p>
          </div>

          <div className="pricing-grid">
            <article className="price-card">
              <h3>One-to-One Coaching</h3>
              <div className="price">₹1,000 <small>/ hour</small></div>
              <p>Individual coaching designed just for you.</p>
              <ul>
                <li>✓ One student per session</li>
                <li>✓ Personalized learning</li>
                <li>✓ Flexible subject selection</li>
                <li>✓ Free first demo</li>
              </ul>
              <a href="#demo" className="btn btn-outline">Book Free Demo</a>
            </article>

            <article className="price-card featured">
              <span className="popular">SMALL GROUP LEARNING</span>
              <h3>Group Coaching</h3>
              <div className="price">₹500 <small>/ student / hour</small></div>
              <p>Focused learning in a group of 10 students.</p>
              <ul>
                <li>✓ Up to 10 students</li>
                <li>✓ ₹5,000 per group hour</li>
                <li>✓ Interactive discussions</li>
                <li>✓ Free first demo</li>
              </ul>
              <a href="#demo" className="btn btn-primary">Book Free Demo</a>
            </article>

            <article className="price-card">
              <h3>Preparation & Evaluation</h3>
              <div className="price">₹1,200 <small>/ course</small></div>
              <p>Online assessments and performance evaluation.</p>
              <ul>
                <li>✓ Online testing</li>
                <li>✓ Performance evaluation</li>
                <li>✓ Identify weak topics</li>
                <li>✓ Actionable feedback</li>
              </ul>
              <a href="#demo" className="btn btn-outline">Enquire Now</a>
            </article>
          </div>
          <p className="pricing-note">
            Coaching hours are purchased in prepaid blocks after the demo class.
          </p>
        </section>

        <section className="demo-section" id="demo">
          <div className="demo-info">
            <span className="eyebrow">GET STARTED</span>
            <h2>Your Learning Journey Begins Here.</h2>
            <p>
              Tell us about your learning goals and prepare to
              experience personalized coaching.
            </p>
            <div className="demo-benefits">
              <p>✓ One free demo class per student</p>
              <p>✓ Explore your preferred subjects</p>
              <p>✓ Meet your tutor before enrolling</p>
            </div>
          </div>

          <div className="demo-form-card">
            <h3>Request a Free Demo</h3>
            <p>Complete the form to prepare your enquiry.</p>

            {submitted ? (
              <div className="form-notice" role="status">
                <strong>Enquiry details prepared.</strong>
                <p>
                  This form is currently a preview. Your details
                  have not been sent or saved. We will connect
                  secure submission in the next development phase.
                </p>
                <button className="btn btn-primary"
                  onClick={() => setSubmitted(false)}>
                  Edit Details
                </button>
              </div>
            ) : (
              <form onSubmit={handleDemo}>
                <label>Student Name
                  <input required value={form.name}
                    placeholder="Enter student name"
                    onChange={(e) => setForm({...form, name: e.target.value})}/>
                </label>
                <label>Parent Email
                  <input required type="email" value={form.email}
                    placeholder="parent@example.com"
                    onChange={(e) => setForm({...form, email: e.target.value})}/>
                </label>
                <label>Contact Number
                  <input required type="tel" value={form.phone}
                    placeholder="Enter contact number"
                    onChange={(e) => setForm({...form, phone: e.target.value})}/>
                </label>
                <div className="form-row">
                  <label>Class
                    <select value={form.grade}
                      onChange={(e) => setForm({...form, grade: e.target.value})}>
                      {['9','10','11','12'].map(g => <option key={g} value={g}>Class {g}</option>)}
                    </select>
                  </label>
                  <label>Program
                    <select value={form.exam}
                      onChange={(e) => setForm({...form, exam: e.target.value})}>
                      <option>JEE Main</option>
                      <option>JEE Advanced</option>
                      <option>NEET</option>
                      <option>Foundation</option>
                    </select>
                  </label>
                </div>
                <button type="submit" className="btn btn-primary submit-btn">
                  Preview Demo Enquiry →
                </button>
                <small>No information is transmitted in this preview.</small>
              </form>
            )}
          </div>
        </section>
      </main>

      <footer>
        <div className="footer-content">
          <div>
            <a href="#" className="logo">
              <span className="logo-mark">✦</span>
              <span>Elevate<span className="brand-accent">Academy</span></span>
            </a>
            <p>Personalized learning for ambitious minds.</p>
          </div>
          <div className="footer-links">
            <a href="#courses">Programs</a>
            <a href="#pricing">Pricing</a>
            <a href="#demo">Free Demo</a>
          </div>
        </div>
        <div className="footer-bottom">
          © {new Date().getFullYear()} Elevate Academy. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

export default App
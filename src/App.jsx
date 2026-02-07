import { useEffect, useMemo, useRef, useState } from 'react'
import emailjs from '@emailjs/browser'
import ProjectCard from './ProjectCard.jsx'
import { projects } from './projects.js'
import Button from './Button.jsx'
import LinkedInButton from './LinkedInButton.jsx'
import './App.css'

function App() {
  const fullHi = useMemo(() => 'Hi! i\'m,', [])
  const fullName = useMemo(() => 'Greyston', [])

  const [navOpen, setNavOpen] = useState(false)
  const navRef = useRef(null)
  const contactFormRef = useRef(null)
  const contactCloseTimeoutRef = useRef(null)
  const contactClosingTimeoutRef = useRef(null)
  const [activeSection, setActiveSection] = useState('top') // 'top' | 'work' | 'about' | 'contact'
  const activeSectionRef = useRef('top')
  const [contactOpen, setContactOpen] = useState(false)
  const [contactClosing, setContactClosing] = useState(false)

  const [hiText, setHiText] = useState('')
  const [nameText, setNameText] = useState('')
  const [typingLine, setTypingLine] = useState('hi') // 'hi' | 'name' | null
  const [contactStatus, setContactStatus] = useState('idle') // idle | sending | sent | error
  const workRef = useRef(null)
  const aboutRef = useRef(null)
  const [workVisible, setWorkVisible] = useState(false)
  const [aboutVisible, setAboutVisible] = useState(false)

  useEffect(() => {
    const navEl = navRef.current
    if (!navEl) return

    const workEl = document.getElementById('work')
    const aboutEl = document.getElementById('about')
    const contactEl = document.getElementById('contact')

    const COLOR_DARK_BG = '#ffffff'
    const COLOR_LIGHT_BG = '#0b0b0b'

    let raf = 0

    const update = () => {
      raf = 0

      // Keep layout below the fixed nav across devices (iOS Safari often renders nav taller)
      // Measure the actual fixed navbar height (includes padding/safe-area).
      const navRect = navEl.getBoundingClientRect()
      const navH = Math.max(0, navRect.height)
      const pageEl = navEl.closest('.page')
      if (pageEl) pageEl.style.setProperty('--nav-h', `${navH}px`)

      // Measure the glass "plate" height (the visual area that should drive the bleed).
      // The plate extends beyond `.nav__inner` by `--nav-plate-inset-y`.
      const navInnerEl = navEl.querySelector('.nav__inner')
      const innerRect = navInnerEl ? navInnerEl.getBoundingClientRect() : navRect
      const insetYRaw = navInnerEl
        ? window.getComputedStyle(navInnerEl).getPropertyValue('--nav-plate-inset-y')
        : '0px'
      const insetY = Number.isFinite(parseFloat(insetYRaw)) ? Math.max(0, parseFloat(insetYRaw)) : 0

      const plateTop = innerRect.top - insetY
      const plateBottom = innerRect.bottom + insetY
      const plateH = Math.max(0, plateBottom - plateTop)

      navEl.style.setProperty('--nav-gradient-h', `${plateH}px`)
      // Offset needed because gradients are painted in each element’s box, not viewport coords.
      navEl.style.setProperty('--nav-gradient-offset', `${innerRect.top - plateTop}px`)

      const workTop = workEl ? workEl.getBoundingClientRect().top : Number.POSITIVE_INFINITY
      const aboutTop = aboutEl ? aboutEl.getBoundingClientRect().top : Number.POSITIVE_INFINITY
      const contactTop = contactEl ? contactEl.getBoundingClientRect().top : Number.POSITIVE_INFINITY

      const boundaries = [
        { top: workTop, below: COLOR_LIGHT_BG }, // landing(dark) -> work(light)
        { top: aboutTop, below: COLOR_DARK_BG }, // work(light) -> about(dark)
        { top: contactTop, below: COLOR_LIGHT_BG }, // about(dark) -> contact(light)
      ].sort((a, b) => a.top - b.top)

      const colorAtY = (y) => {
        // Determine which section is behind a given viewport Y.
        // (Colors are nav ink colors: white over dark, black over light.)
        if (contactTop <= y) return COLOR_LIGHT_BG
        if (aboutTop <= y) return COLOR_DARK_BG
        if (workTop <= y) return COLOR_LIGHT_BG
        return COLOR_DARK_BG
      }

      // Determine colors at the top/bottom of the *plate*.
      const sampleTopY = Math.max(0, Math.min(plateTop + 1, window.innerHeight - 1))
      const sampleBottomY = Math.max(0, Math.min(plateBottom - 1, window.innerHeight - 1))
      const topColor = colorAtY(sampleTopY)
      const bottomColor = colorAtY(sampleBottomY)

      // Find the first boundary that is currently inside the plate (so we can split within it).
      let splitLocalY = plateH
      const candidates = boundaries.filter((b) => b.top > plateTop && b.top < plateBottom)
      if (candidates.length > 0) {
        const next = candidates.reduce((min, b) => (b.top < min.top ? b : min), candidates[0])
        // Small visual alignment nudge: the glass border/blur makes the “visible” boundary
        // appear a few px higher than raw bounding-box math on some browsers.
        const SPLIT_NUDGE_PX = 6
        splitLocalY = next.top - plateTop - SPLIT_NUDGE_PX
      }

      const clampedSplit = Math.max(0, Math.min(splitLocalY, plateH))
      navEl.style.setProperty('--nav-top-color', topColor)
      navEl.style.setProperty('--nav-bottom-color', bottomColor)
      navEl.style.setProperty('--nav-split-y', `${clampedSplit}px`)

      // Active link (based on what’s behind the nav)
      const probeY = Math.min(sampleBottomY + 1, window.innerHeight - 1)
      const nextActive =
        workTop > probeY
          ? 'top'
          : aboutTop > probeY
            ? 'work'
            : contactTop > probeY
              ? 'about'
              : 'contact'

      if (activeSectionRef.current !== nextActive) {
        activeSectionRef.current = nextActive
        setActiveSection(nextActive)
      }
    }

    const schedule = () => {
      if (raf) return
      raf = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)

    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (raf) window.cancelAnimationFrame(raf)
    }
  }, [])

  useEffect(() => {
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduceMotion) {
      setHiText(fullHi)
      setNameText(fullName)
      setTypingLine(null)
      return
    }

    const timeouts = []
    const typeSpeed = 55
    const pauseBetween = 280

    const schedule = (fn, ms) => {
      const id = window.setTimeout(fn, ms)
      timeouts.push(id)
    }

    const typeHi = (idx) => {
      setHiText(fullHi.slice(0, idx))
      if (idx <= fullHi.length) {
        schedule(() => typeHi(idx + 1), typeSpeed)
      } else {
        setTypingLine('name')
        schedule(() => typeName(1), pauseBetween)
      }
    }

    const typeName = (idx) => {
      setNameText(fullName.slice(0, idx))
      if (idx <= fullName.length) {
        schedule(() => typeName(idx + 1), typeSpeed)
      } else {
        setTypingLine(null)
      }
    }

    setTypingLine('hi')
    typeHi(1)

    return () => {
      timeouts.forEach((id) => window.clearTimeout(id))
    }
  }, [fullHi, fullName])

  useEffect(() => {
    const options = { root: null, rootMargin: '120px 0px', threshold: 0.1 }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        if (entry.target === workRef.current) setWorkVisible(true)
        if (entry.target === aboutRef.current) setAboutVisible(true)
      })
    }, options)

    if (workRef.current) observer.observe(workRef.current)
    if (aboutRef.current) observer.observe(aboutRef.current)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!contactOpen) return
    setContactStatus('idle')
    setContactClosing(false)

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setContactOpen(false)
      }
    }

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', onKeyDown)
      if (contactCloseTimeoutRef.current) {
        window.clearTimeout(contactCloseTimeoutRef.current)
        contactCloseTimeoutRef.current = null
      }
      if (contactClosingTimeoutRef.current) {
        window.clearTimeout(contactClosingTimeoutRef.current)
        contactClosingTimeoutRef.current = null
      }
    }
  }, [contactOpen])

  const closeContactModal = (delay = 0) => {
    if (contactClosingTimeoutRef.current) {
      window.clearTimeout(contactClosingTimeoutRef.current)
      contactClosingTimeoutRef.current = null
    }
    if (contactCloseTimeoutRef.current) {
      window.clearTimeout(contactCloseTimeoutRef.current)
      contactCloseTimeoutRef.current = null
    }
    contactClosingTimeoutRef.current = window.setTimeout(() => {
      setContactClosing(true)
      contactCloseTimeoutRef.current = window.setTimeout(() => {
        setContactOpen(false)
        setContactClosing(false)
      }, 420)
    }, delay)
  }

  return (
    <div className="page">
      <nav
        ref={navRef}
        className={'nav' + (navOpen ? ' nav--open' : '')}
        aria-label="Primary"
      >
        <div className="nav__inner">
          <a className="nav__brand" href="#top" onClick={() => setNavOpen(false)}>
            <span className="nav__wordmark nav__ink">Greyston</span>
          </a>

          <div className="nav__links" role="navigation" aria-label="Sections">
            <a
              className={'nav__link' + (activeSection === 'top' ? ' nav__link--active' : '')}
              href="#top"
              aria-current={activeSection === 'top' ? 'page' : undefined}
              onClick={() => {
                activeSectionRef.current = 'top'
                setActiveSection('top')
                setNavOpen(false)
              }}
            >
              <span className="nav__ink">Home</span>
            </a>
            <a
              className={'nav__link' + (activeSection === 'work' ? ' nav__link--active' : '')}
              href="#work"
              aria-current={activeSection === 'work' ? 'page' : undefined}
              onClick={() => {
                activeSectionRef.current = 'work'
                setActiveSection('work')
                setNavOpen(false)
              }}
            >
              <span className="nav__ink">Work</span>
            </a>
            <a
              className={'nav__link' + (activeSection === 'about' ? ' nav__link--active' : '')}
              href="#about"
              aria-current={activeSection === 'about' ? 'page' : undefined}
              onClick={() => {
                activeSectionRef.current = 'about'
                setActiveSection('about')
                setNavOpen(false)
              }}
            >
              <span className="nav__ink">About</span>
            </a>
            <button
              className="nav__link nav__link--cta"
              type="button"
              onClick={() => {
                setContactOpen(true)
                setNavOpen(false)
              }}
            >
              <span className="nav__ink">Let’s talk</span>
            </button>
          </div>

          <button
            className="nav__ctaMobile nav__link nav__link--cta"
            type="button"
            onClick={() => {
              setContactOpen(true)
              setNavOpen(false)
            }}
          >
            <span className="nav__ink">Let’s talk</span>
          </button>

          <button
            className="nav__toggle"
            type="button"
            aria-label={navOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={navOpen}
            onClick={() => setNavOpen((v) => !v)}
          >
            <span className="nav__toggleLines" aria-hidden />
          </button>
        </div>

        <div className="nav__panel" aria-hidden={!navOpen}>
          <a
            className={'nav__panelLink' + (activeSection === 'top' ? ' nav__panelLink--active' : '')}
            href="#top"
            aria-current={activeSection === 'top' ? 'page' : undefined}
            onClick={() => {
              activeSectionRef.current = 'top'
              setActiveSection('top')
              setNavOpen(false)
            }}
          >
            Home
          </a>
          <a
            className={'nav__panelLink' + (activeSection === 'work' ? ' nav__panelLink--active' : '')}
            href="#work"
            aria-current={activeSection === 'work' ? 'page' : undefined}
            onClick={() => {
              activeSectionRef.current = 'work'
              setActiveSection('work')
              setNavOpen(false)
            }}
          >
            Work
          </a>
          <a
            className={'nav__panelLink' + (activeSection === 'about' ? ' nav__panelLink--active' : '')}
            href="#about"
            aria-current={activeSection === 'about' ? 'page' : undefined}
            onClick={() => {
              activeSectionRef.current = 'about'
              setActiveSection('about')
              setNavOpen(false)
            }}
          >
            About
          </a>
        </div>
      </nav>

      <div className="landing" id="top">
        <div
          className="landing__bg"
          role="img"
          aria-label="Greyston working on laptop in a minimal interior"
        />
        <div className="landing__content">
          <header
            className={
              'landing__headline' + (typingLine === null ? ' landing__headline--done' : '')
            }
            aria-label="Hi, I am Greyston"
          >
            <div className="landing__headlinePlate">
              <div className="landing__hi">
                {hiText}
                {typingLine === 'hi' ? (
                  <span className="landing__cursor" aria-hidden>
                    ▍
                  </span>
                ) : null}
              </div>
              <div className="landing__name">
                <span className="landing__nameText">
                  {nameText}
                  {typingLine === 'name' ? (
                    <span className="landing__cursor" aria-hidden>
                      ▍
                    </span>
                  ) : null}
                </span>
              </div>

              <div
                className={
                  'landing__tagline' + (typingLine === null ? ' landing__tagline--show' : '')
                }
              >
                <span className="landing__taglineText">
                  <span className="landing__taglineLeadWrap">
                    <span className="landing__taglineLead">THE DEVELOPERS,</span>
                  </span>
                  <span className="landing__taglineStrong">DEVELOPER.</span>
                </span>
              </div>

              <a className="landing__subcta" href="#about">
                <span className="landing__subctaText hover-underline">
                  Click to see how I accelerate your workflow{' '}
                  <span className="landing__subctaArrow" aria-hidden>
                    →
                  </span>
                </span>
              </a>
            </div>
          </header>
        </div>
      </div>

      <section className="section section--photo" id="work" aria-label="Work" ref={workRef}>
        <div className="section__inner">
          <div className="section__titleRow">
            <h2 className="section__title">Work</h2>
            <Button />
          </div>
          <p className="section__body">
            A few projects and experiments.
          </p>
        </div>

        {workVisible ? (
          <div className="workGridArea" role="list" aria-label="Projects">
            <div className="workGrid">
              {projects.map((p) => (
                <div className="workGrid__item" role="listitem" key={p.title}>
                  <ProjectCard {...p} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="workGridArea workGridArea--placeholder" aria-hidden />
        )}
      </section>

      <section className="section section--alt" id="about" aria-label="About" ref={aboutRef}>
        <div className="section__inner">
          <div className="about__titleWrap">
            <h2 className="section__title">About</h2>
          </div>
          <div className="about__contentWrap">
            {aboutVisible ? (
              <div className="about">
            <div className="about__header">
              <p className="about__contact">
                Toronto, Ontario |{' '}
                <a className="about__link" href="tel:+19054679123">
                  905-467-9123
                </a>{' '}
                |{' '}
                <a className="about__link" href="mailto:greybellino@gmail.com">
                  greybellino@gmail.com
                </a>
                | <LinkedInButton />
              </p>
            </div>

            <div className="about__block">
              <div className="about__summary">
                <h3 className="about__summaryTitle">Who I Am</h3>
                <p className="about__body">
                  Experienced in software development, data science, and cloud-based solutions,
                  with a proven ability to enhance workflows and optimize system performance.
                  Proficient in Python, TypeScript, SQL, and frameworks including React and Angular,
                  with hands-on expertise in front-end web application development, ETL pipelines,
                  and AI/ML applications.
                </p>
                <p className="about__body">
                  In AI, I focus on practical acceleration: building local LLM proof‑of‑concepts,
                  automating high‑leverage workflows, and integrating AI into real systems where it
                  delivers measurable speed and quality gains. I prioritize explainable, secure,
                  and maintainable AI solutions that teams can ship and scale.
                </p>
                <p className="about__body">
                  I accelerate workflows by automating repetitive steps, tightening feedback loops,
                  and shipping reliable integrations that reduce operational friction. I have led
                  projects that improved operational efficiency, automated compliance processes,
                  and streamlined user experiences. Adept at problem-solving, data-driven
                  decision-making, and collaborative development, I bring a strong analytical
                  mindset and technical acumen to every project. Highly motivated to take on new
                  challenges, and committed to solving them.
                </p>
              </div>
              <h3 className="about__heading">Experience</h3>

              <div className="about__role">
                <p className="about__title">
                  <strong>
                    Deloitte — Software Developer &amp; AI Research &amp; Development (Current)
                  </strong>
                </p>
                <ul className="about__list">
                  <li>
                    Deliver functional development for Air Canada programs, translating stories
                    into clean, testable work and partnering with the EIP (Enterprise Integration
                    Platform) team to resolve defects, change requests, and mapping issues across
                    integrated systems.
                  </li>
                  <li>
                    Build proof-of-concept solutions with local LLMs for internal and client-facing
                    use cases, and drive AI Acceleration initiatives that shorten the software
                    development lifecycle inside Deloitte.
                  </li>
                </ul>
              </div>

              <div className="about__role">
                <p className="about__title">
                  Optimized Product Setup and Creation Interface - Software Developer, Hatch (2024)
                </p>
                <ul className="about__list">
                  <li>
                    Leveraged front-end development expertise in TypeScript and Angular to design
                    and implement a robust product setup and creation page, streamlining the user
                    experience for adding and managing products. This enhancement improved workflow
                    efficiency by 30%, reducing the time required for product setup by team members.
                  </li>
                  <li>
                    Exhibited a keen interest in UI/UX design principles, resulting in a more
                    intuitive and responsive interface. This led to a 25% increase in user
                    satisfaction and a 15% reduction in error rates during product entry.
                  </li>
                </ul>
              </div>

              <div className="about__role">
                <p className="about__title">
                  Automated Employee Vacation Compliance - Data Scientist, RBC (2023)
                </p>
                <ul className="about__list">
                  <li>
                    Developed an ETL pipeline leveraging Python's pandas library to extract data
                    from Excel sheets, applying a custom algorithm to identify non-compliant
                    employee vacation dates for a workforce of 10,000 employees. The data was
                    integrated into an SQL database for further analysis.
                  </li>
                  <li>
                    Enhanced decision-making by creating a dynamic Tableau dashboard that
                    visualized non-compliant vacation patterns, enabling HR teams to enforce
                    policies effectively. This automation saved 8 hours of human labor per week and
                    reduced unauthorized time-off incidents by 40%.
                  </li>
                </ul>
              </div>

              <div className="about__role">
                <p className="about__title">
                  Cloud-Based Oil and Gas Rig Data Processing Pipeline - Data Scientist, Hatch
                  (2022)
                </p>
                <ul className="about__list">
                  <li>
                    Migrated a MATLAB-based project to Python for an oil and gas rig, enhancing
                    computational efficiency and scalability. Data from Excel sheets was ingested,
                    processed in HYSYS for complex calculations, and visualized in XMPRO.
                  </li>
                  <li>
                    Optimized the end-to-end data processing pipeline, enabling real-time analysis
                    and decision-making. This reduced costs by eliminating MATLAB licenses.
                  </li>
                </ul>
              </div>

              <div className="about__role">
                <p className="about__title">Technical Skills</p>
                <p className="about__meta"><strong>Hard Skills</strong></p>
                <ul className="about__list">
                  <li>Programming Languages: Python, Java, C, Rust, R, SQL, JavaScript, TypeScript, GraphQL, Lisp</li>
                  <li>Frameworks &amp; Libraries: Node.js, Angular, Django, Flask, Pandas, NumPy, TensorFlow, RxJs, Tailwind, Flex, Bootstrap</li>
                  <li>Front-End Development: HTML, CSS, TypeScript, JavaScript, UI/UX principles</li>
                  <li>Database Management: SQL, GraphQL, PostgreSQL</li>
                  <li>Cloud &amp; DevOps: Microsoft Azure, GitHub, Git, CI/CD Pipelines</li>
                  <li>Data Science &amp; Analytics: Machine Learning, Data Visualization, ETL Pipelines, Tableau</li>
                  <li>Software Development: Object-Oriented Programming, Software Engineering Principles, Agile Methodologies</li>
                </ul>
                <p className="about__meta"><strong>Soft Skills</strong></p>
                <ul className="about__list">
                  <li>Problem-Solving: Strong analytical and troubleshooting skills</li>
                  <li>Collaboration: Effective teamwork and cross-functional communication</li>
                  <li>Adaptability: Ability to learn and apply new technologies quickly</li>
                  <li>Time Management: Efficiently prioritizing and balancing multiple projects</li>
                  <li>Communication: Clear technical documentation and presentation skills</li>
                  <li>Attention to Detail: Ensuring accuracy and efficiency in coding and UI/UX design</li>
                  <li>Leadership: Proactively leading projects and mentoring peers when needed</li>
                  <li>Commitment: Dedicated to continuous learning and delivering high-quality work</li>
                  <li>Highly Motivated: Passionate about technology and solving complex challenges</li>
                  <li>Approachability: Open and friendly, fostering a positive and collaborative work environment</li>
                </ul>
              </div>

              <div className="about__role">
                <p className="about__title">Education</p>
                <p className="about__meta">
                  BACHELOR OF SCIENCE (HONS) COMPUTER SCIENCE
                </p>
                <p className="about__meta">Toronto Metropolitan University | Toronto, ON</p>
                <p className="about__meta">CGPA 3.7, Dean's List for 2 Years (2nd and 3rd year)</p>
                <p className="about__meta">
                  Relevant Coursework: Data Structures, Discrete Structures, Algorithms, Databases,
                  Artificial Intelligence, Machine Learning, Software Engineering, Software Project
                  Management, Operating Systems, Cyber-Security
                </p>
                <p className="about__meta">Minors: Cyber-Security</p>
              </div>
            </div>
              </div>
            ) : (
              <div className="about about--placeholder" aria-hidden />
            )}
          </div>
        </div>
      </section>

      {contactOpen ? (
        <div
          className={'contactModal' + (contactClosing ? ' contactModal--closing' : '')}
          role="dialog"
          aria-modal="true"
          aria-label="Contact"
        >
          <div
            className="contactModal__backdrop"
            onClick={() => closeContactModal(0)}
            aria-hidden
          />
          <div className="contactModal__panel">
            <button
              className="contactModal__close"
              type="button"
              onClick={() => closeContactModal(0)}
              aria-label="Close contact form"
            >
              ×
            </button>
            <h2 className="contactModal__title">Let’s talk</h2>
            <p className="contactModal__sub">
              Send a quick note and I will reply soon.
            </p>
            <form
              ref={contactFormRef}
              className="contactForm"
              aria-label="Contact form"
              onSubmit={(e) => {
                e.preventDefault()
                if (!contactFormRef.current) return

                const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
                const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
                const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

                if (!serviceId || !templateId || !publicKey) {
                  setContactStatus('error')
                  return
                }

                setContactStatus('sending')
                emailjs
                  .sendForm(serviceId, templateId, contactFormRef.current, { publicKey })
                  .then(() => {
                    setContactStatus('sent')
                    contactFormRef.current.reset()
                    closeContactModal(1200)
                  })
                  .catch(() => {
                    setContactStatus('error')
                  })
              }}
            >
              <input type="hidden" name="to_name" value="Greyston" />
              <div className="contactForm__grid">
                <div className="contactForm__row">
                  <label className="contactForm__label" htmlFor="contact-name">Name</label>
                  <input
                    className="contactForm__input"
                    id="contact-name"
                    name="from_name"
                    type="text"
                    autoComplete="name"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div className="contactForm__row">
                  <label className="contactForm__label" htmlFor="contact-email">Email</label>
                  <input
                    className="contactForm__input"
                    id="contact-email"
                    name="reply_to"
                    type="email"
                    autoComplete="email"
                    placeholder="you@email.com"
                    required
                  />
                </div>
              </div>
              <div className="contactForm__row">
                <label className="contactForm__label" htmlFor="contact-number">Phone (optional)</label>
                <input
                  className="contactForm__input"
                  id="contact-number"
                  name="number"
                  type="tel"
                  autoComplete="tel"
                  placeholder="(555) 555-5555"
                />
              </div>
              <div className="contactForm__row">
                <label className="contactForm__label" htmlFor="contact-message">Message</label>
                <textarea
                  className="contactForm__textarea"
                  id="contact-message"
                  name="message"
                  rows="5"
                  placeholder="Tell me about your project..."
                  required
                />
              </div>
              <div className="contactForm__actions">
                <button
                  className="contactForm__button"
                  type="submit"
                  disabled={contactStatus === 'sending'}
                >
                  {contactStatus === 'sending' ? 'Sending...' : 'Send message'}
                </button>
                {contactStatus === 'sent' ? (
                  <p className="contactForm__status">Thanks! Your message is on its way.</p>
                ) : null}
                {contactStatus === 'error' ? (
                  <p className="contactForm__status contactForm__status--error">
                    Something went wrong. Please email me directly.
                  </p>
                ) : null}
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default App

import { Suspense, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { ScrollControls, Scroll, Preload } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import { Ticket, ArrowRight, Sparkles, QrCode, CreditCard, ChevronDown, CalendarCheck, Zap, Users, Building2, Star } from 'lucide-react';
import Scene3D from '../components/3d/Scene3D';
import './Landing.css';

function LoadingScreen() {
  return (
    <div className="landing-loader">
      <div className="landing-loader__icon">
        <Ticket size={32} />
      </div>
      <div className="landing-loader__text">Loading Experience...</div>
      <div className="landing-loader__bar">
        <div className="landing-loader__progress"></div>
      </div>
    </div>
  );
}

function Fallback3D() {
  return (
    <mesh>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshBasicMaterial color="#6366f1" wireframe />
    </mesh>
  );
}

function HtmlOverlay() {
  const navigate = useNavigate();
  const overlayRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-up');
        }
      });
    }, { threshold: 0.1 });

    const hiddenElements = overlayRef.current?.querySelectorAll('.reveal-on-scroll');
    if (hiddenElements) hiddenElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <Scroll html style={{ width: '100%' }}>
      <div ref={overlayRef}>
        <div className="bg-noise" />

        {/* ── SECTION 1: HERO ── */}
        <section className="landing-section landing-hero">

          {/* Left column: text */}
          <div className="landing-hero__content">
            <div className="landing-hero__badge">
              <Sparkles size={13} />
              <span>The Ultimate Fest Experience</span>
            </div>

            <h1 className="landing-hero__title">
              <span className="landing-hero__title-line">Experience</span>
              <span className="landing-hero__title-line">Unforgettable</span>
              <span className="landing-hero__title-accent">Moments</span>
            </h1>

            <p className="landing-hero__subtitle">
              Join the most electrifying college festival.<br />
              Music, Hackathons, Sports, and endless memories all in one place.
            </p>

            <div className="landing-hero__cta-group">
              <button className="landing-btn landing-btn--primary" onClick={() => navigate('/login')}>
                Get Started <ArrowRight size={16} />
              </button>
              <button className="landing-btn landing-btn--ghost" onClick={() => {
                const el = document.querySelector('.explore-events-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}>
                Explore Events <ChevronDown size={16} />
              </button>
            </div>
          </div>

          {/* Stats bar — spans full width at bottom of grid */}
          <div className="hero-stats-bar">
            <div className="hero-stat-item">
              <Users color="#ff007f" size={28} />
              <div>
                <h4>500+</h4>
                <p>College Events</p>
              </div>
            </div>
            <div className="hero-stat-item">
              <Ticket color="#a200ff" size={28} />
              <div>
                <h4>50K+</h4>
                <p>Tickets Sold</p>
              </div>
            </div>
            <div className="hero-stat-item">
              <Building2 color="#a200ff" size={28} />
              <div>
                <h4>120+</h4>
                <p>Campus Partners</p>
              </div>
            </div>
            <div className="hero-stat-item">
              <Star color="#ff007f" size={28} />
              <div>
                <h4>4.8/5</h4>
                <p>User Rating</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 2: EXPLORE EVENTS ── */}
        <section className="landing-section explore-events-section">
          <div className="explore-events-bg-text">EXPLORE EVENTS</div>
          <div className="explore-events__content">
            <div className="explore-cards-container">

            {/* Row 1: 3 cards */}
            <div className="explore-cards-row">

              <div className="explore-card tilt-left-slight">
                <div className="explore-card-inner">
                  <div className="explore-badge">Explore</div>
                  <div className="explore-card-top">TECHNICAL TRACK</div>
                  <div className="explore-card-img" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1740&auto=format&fit=crop")' }}></div>
                  <div className="explore-card-bottom">
                    <h3>Hackathons</h3>
                    <p>Build. Code. Innovate. Win Prizes.</p>
                  </div>
                </div>
              </div>

              <div className="explore-card tilt-right">
                <div className="explore-card-inner">
                  <div className="explore-badge">Explore</div>
                  <div className="explore-card-top">CULTURAL TRACK</div>
                  <div className="explore-card-img" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1740&auto=format&fit=crop")' }}></div>
                  <div className="explore-card-bottom">
                    <h3>Performances</h3>
                    <p>Music. Dance. Art. Expression.</p>
                  </div>
                </div>
              </div>

              <div className="explore-card tilt-left">
                <div className="explore-card-inner">
                  <div className="explore-badge">Explore</div>
                  <div className="explore-card-top">SPORTS TRACK</div>
                  <div className="explore-card-img" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1740&auto=format&fit=crop")' }}></div>
                  <div className="explore-card-bottom">
                    <h3>Tournaments</h3>
                    <p>Compete. Sweat. Dominate.</p>
                  </div>
                </div>
              </div>

            </div>{/* end row 1 */}

            {/* Row 2: Signature Event — centered, wider */}
            <div className="explore-cards-row explore-cards-row--centered">

              <div className="explore-card explore-card--featured">
                <div className="explore-card-inner">
                  <div className="explore-badge">Explore</div>
                  <div className="explore-card-top">SIGNATURE EVENT</div>
                  <div className="explore-card-img" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1740&auto=format&fit=crop")' }}></div>
                  <div className="explore-card-bottom">
                    <h3>Main Concert</h3>
                    <p>The Ultimate Musical Experience</p>
                  </div>
                </div>
              </div>

            </div>{/* end row 2 */}

            </div>{/* end explore-cards-container */}
          </div>{/* end explore-events__content */}
        </section>

        {/* ── SECTION 3: HOW IT WORKS ── */}
        <section className="landing-section landing-howitworks">
          <div className="landing-howitworks__content">
            <h2 className="landing-section-title">How It Works</h2>
            <p className="landing-section-subtitle">Three simple steps to seamless events</p>

            <div className="landing-steps">
              <div className="landing-step reveal-delay-1">
                <div className="landing-step__icon-wrapper">
                  <CalendarCheck size={34} />
                </div>
                <div className="landing-step__number">01</div>
                <h3>Create Event</h3>
                <p>Set up event details, tracks, and custom ticket tiers effortlessly.</p>
              </div>

              <div className="landing-step reveal-delay-2">
                <div className="landing-step__icon-wrapper">
                  <Ticket size={34} />
                </div>
                <div className="landing-step__number">02</div>
                <h3>Sell & Distribute</h3>
                <p>Process seamless sales and immediately deliver QR tickets via email.</p>
              </div>

              <div className="landing-step reveal-delay-3">
                <div className="landing-step__icon-wrapper">
                  <QrCode size={34} />
                </div>
                <div className="landing-step__number">03</div>
                <h3>Scan & Enter</h3>
                <p>Lightning-fast QR validation at the gate. Zero duplicates, pure flow.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 4: CTA ── */}
        <section
          className="landing-section landing-cta"
          style={{
            backgroundImage: 'linear-gradient(rgba(6,8,16,0.82), rgba(6,8,16,0.88)), url("https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=2000&q=80")',
            backgroundAttachment: 'fixed',
          }}
        >
          <div className="glow-aura"></div>
          <div className="landing-cta__content">
            <Zap size={44} color="#00f0ff" style={{ margin: '0 auto 18px', display: 'block', filter: 'drop-shadow(0 0 12px #00f0ff)' }} />
            <h2 className="landing-cta__title">Ready to Drop the Beat?</h2>
            <p className="landing-cta__subtitle">
              Join the platform that defines the ultimate fest experience.<br />
              Scale your festival from 100 to 10,000+ attendees without breaking a sweat.
            </p>
            <button className="landing-btn landing-btn--primary landing-btn--xl" onClick={() => navigate('/login')}>
              Host Your Fest <ArrowRight size={20} />
            </button>
            <div className="landing-cta__roles">
              <span>Organizers</span>
              <span className="landing-cta__dot">·</span>
              <span>Promoters</span>
              <span className="landing-cta__dot">·</span>
              <span>Volunteers</span>
            </div>
          </div>
        </section>

      </div>
    </Scroll>
  );
}

export default function Landing() {
  return (
    <div className="landing-page">
      <Suspense fallback={<LoadingScreen />}>
        <Canvas
          camera={{ position: [1.5, 1, 8], fov: 50, near: 0.1, far: 100 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: false }}
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}
        >
          <color attach="background" args={['#060810']} />
          <ScrollControls pages={4} damping={0.25}>
            <Suspense fallback={<Fallback3D />}>
              <Scene3D />
            </Suspense>
            <HtmlOverlay />
          </ScrollControls>
          <Preload all />
        </Canvas>
      </Suspense>
    </div>
  );
}

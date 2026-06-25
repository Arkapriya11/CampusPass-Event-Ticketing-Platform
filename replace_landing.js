const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/Landing.jsx', 'utf8');

c = c.replace('function HtmlOverlay() {\r\n  const navigate = useNavigate();\r\n\r\n  return (\r\n    <Scroll html style={{ width: \\'100%\\' }}>\r\n      {/* Section 1: Hero */}', `function HtmlOverlay() {
  const navigate = useNavigate();
  const overlayRef = useRef(null);

  // Intersection Observer for scroll-based slide-up reveals
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-up');
        }
      });
    }, { threshold: 0.1 });

    const hiddenElements = overlayRef.current?.querySelectorAll('.reveal-on-scroll');
    if(hiddenElements) hiddenElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <Scroll html style={{ width: '100%' }}>
      <div ref={overlayRef}>
        <div className="bg-noise" />
      {/* Section 1: Hero */}`);

c = c.replace(/<div className="landing-steps">[\s\S]*?<div className="landing-cta__roles">[\s\S]*?<\/div>\r\n        <\/div>\r\n      <\/section>/, `<div className="landing-steps">
            <div className="landing-step reveal-on-scroll reveal-delay-1">
              <div className="landing-step__icon-wrapper">
                <CalendarCheck size={36} />
              </div>
              <div className="landing-step__number">01</div>
              <h3>Create Event</h3>
              <p>Set up event details, tracks, and custom ticket tiers effortlessly.</p>
            </div>
            
            <div className="landing-step reveal-on-scroll reveal-delay-2">
              <div className="landing-step__icon-wrapper">
                <Ticket size={36} />
              </div>
              <div className="landing-step__number">02</div>
              <h3>Sell & Distribute</h3>
              <p>Process seamless sales and immediately deliver QR tickets via email.</p>
            </div>
            
            <div className="landing-step reveal-on-scroll reveal-delay-3">
              <div className="landing-step__icon-wrapper">
                <QrCode size={36} />
              </div>
              <div className="landing-step__number">03</div>
              <h3>Scan & Enter</h3>
              <p>Lightning-fast QR validation at the gate. Zero duplicates, pure flow.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Stats with Cinematic Background */}
      <section className="landing-section landing-stats" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=2670&auto=format&fit=crop")' }}>
        <div className="landing-stats__content reveal-on-scroll">
          <h2 className="landing-section-title">Trusted by Top Campuses</h2>
          <p className="landing-section-subtitle">Scale your festival from 100 to 10,000+ attendees without breaking a sweat.</p>
        </div>
      </section>

      {/* Section 5: CTA */}
      <section className="landing-section landing-cta">
        <div className="glow-aura"></div>
        <div className="landing-cta__content reveal-on-scroll">
          <Zap size={48} color="#00f0ff" style={{ margin: '0 auto 20px', display: 'block', filter: 'drop-shadow(0 0 10px #00f0ff)' }} />
          <h2 className="landing-cta__title">Ready to Drop the Beat?</h2>
          <p className="landing-cta__subtitle">
            Join the platform that defines the ultimate fest experience.
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
      </div>`);

fs.writeFileSync('frontend/src/pages/Landing.jsx', c);

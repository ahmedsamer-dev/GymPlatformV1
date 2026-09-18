import {
  ArrowRight,
  Building2,
  Check,
  Crown,
  CreditCard,
  Dumbbell,
  KeyRound,
  Menu,
  ShieldCheck,
  UserCog,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../../components/brand/BrandLogo';
import './landing.css';

/* Real GymMaster capabilities only — every claim below reflects an
   implemented backend feature, with no invented statistics, testimonials,
   or customers. */

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#roles', label: 'Roles' },
];

const FEATURES = [
  {
    icon: Users,
    tone: 'blue',
    wide: true,
    tint: true,
    title: 'Member Management',
    desc: 'Manage members, profiles, and subscriptions from one place.',
    points: ['Member profiles per gym', 'Live subscription status'],
  },
  {
    icon: UserCog,
    tone: 'green',
    wide: false,
    title: 'Trainer Management',
    desc: 'Manage trainers and control their gym access.',
    points: [],
  },
  {
    icon: CreditCard,
    tone: 'purple',
    wide: true,
    title: 'Memberships & Subscriptions',
    desc: 'Create flexible membership plans and manage subscriptions and renewals.',
    points: ['Time-based & session-based plans', 'Remaining sessions tracked'],
  },
  {
    icon: ShieldCheck,
    tone: 'navy',
    wide: false,
    title: 'Role-Based Access',
    desc: 'Give Admins, Owners, and Trainers the right access to the right resources.',
    points: [],
  },
];

const STEPS = [
  {
    num: '01',
    title: 'Create your gym',
    desc: 'Apply as a Gym Owner and set up your gym.',
  },
  {
    num: '02',
    title: 'Add trainers',
    desc: 'Create trainers and manage their access.',
  },
  {
    num: '03',
    title: 'Manage members',
    desc: 'Create membership plans, members, and subscriptions.',
  },
];

const ROLES = [
  {
    icon: Crown,
    tone: 'blue',
    title: 'Gym Owner',
    desc: 'Manage gyms, trainers, membership plans, and operations.',
    chips: ['Gyms', 'Trainers', 'Plans', 'Members'],
  },
  {
    icon: UserRound,
    tone: 'green',
    title: 'Trainer',
    desc: 'Manage members, subscriptions, and daily member operations.',
    chips: ['Members', 'Subscriptions'],
  },
  {
    icon: ShieldCheck,
    tone: 'navy',
    title: 'Admin',
    desc: 'Manage the platform, gym owners, applications, and gyms.',
    chips: ['Applications', 'Owners', 'Gyms'],
  },
];

/* Adds .is-visible when the element enters the viewport (subtle entrance). */
function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-visible');
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className ? `lp-reveal ${className}` : 'lp-reveal'}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

function Navbar({
  menuOpen,
  onToggleMenu,
  onCloseMenu,
}: {
  menuOpen: boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
}) {
  return (
    <header className="lp-nav">
      <div className="lp-container lp-nav__inner">
        <Link to="/" className="lp-brand" aria-label="GymMaster home">
          <BrandLogo size={36} />
          <span>GymMaster</span>
        </Link>

        <nav className="lp-nav__links" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <a key={link.href} className="lp-nav__link" href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="lp-nav__actions">
          <Link to="/apply" className="lp-btn lp-btn--secondary">
            Become a Gym Owner
          </Link>
          <Link to="/login" className="lp-btn lp-btn--primary">
            Sign In
          </Link>
        </div>

        <button
          type="button"
          className="lp-nav__toggle"
          onClick={onToggleMenu}
          aria-expanded={menuOpen}
          aria-controls="lp-mobile-nav"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        >
          {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        </button>
      </div>

      <div id="lp-mobile-nav" className={menuOpen ? 'lp-nav__mobile lp-nav__mobile--open' : 'lp-nav__mobile'}>
        <div className="lp-container">
          <nav aria-label="Mobile">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} onClick={onCloseMenu}>
                {link.label}
              </a>
            ))}
          </nav>
          <div className="lp-nav__mobile-actions">
            <Link to="/apply" className="lp-btn lp-btn--secondary" onClick={onCloseMenu}>
              Become a Gym Owner
            </Link>
            <Link to="/login" className="lp-btn lp-btn--primary" onClick={onCloseMenu}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

/* Illustrative product preview — clearly labeled as such, never real data. */
function DashboardShot() {
  const kpis = [
    { label: 'Gym Owners', value: '12', delta: '+2', dir: 'up' },
    { label: 'Active Members', value: '248', delta: '+14', dir: 'up' },
    { label: 'Trainers', value: '18', delta: '-1', dir: 'down' },
    { label: 'Plans', value: '6', delta: null, dir: null },
  ];
  const rows = [
    { name: 'Omar K.', sub: 'Strength — 12 sessions', status: 'Active', tone: 'green' },
    { name: 'Laila M.', sub: 'CrossFit — 4 remaining', status: 'Active', tone: 'green' },
    { name: 'Youssef A.', sub: 'Boxing — expired', status: 'Expired', tone: 'red' },
    { name: 'Nour H.', sub: 'Personal — pending', status: 'Pending', tone: 'amber' },
  ];
  const sideItems = ['Dashboard', 'Applications', 'Owners', 'Gyms'];

  return (
    <div className="lp-shot-wrap">
      <div className="lp-shot" aria-hidden="true">
        <div className="lp-shot__bar">
          <span className="lp-shot__dot" />
          <span className="lp-shot__dot" />
          <span className="lp-shot__dot" />
          <span className="lp-shot__title">GymMaster — Admin</span>
        </div>
        <div className="lp-shot__body">
          <div className="lp-shot__side">
            {sideItems.map((item, i) => (
              <span key={item} className={i === 0 ? 'lp-shot__side-item is-active' : 'lp-shot__side-item'}>
                {item}
              </span>
            ))}
          </div>
          <div className="lp-shot__main">
            <div className="lp-kpis">
              {kpis.map((k) => (
                <div key={k.label} className="lp-kpi">
                  <span className="lp-kpi__value">
                    {k.value}
                    {k.delta && <em className={`lp-kpi__delta lp-kpi__delta--${k.dir}`}>{k.delta}</em>}
                  </span>
                  <span className="lp-kpi__label">{k.label}</span>
                </div>
              ))}
            </div>
            <div className="lp-shot__chart">
              <span className="lp-shot__chart-label">Weekly check-ins</span>
              <span className="lp-shot__chart-bars">
                {[42, 68, 55, 80, 62, 92, 74].map((h, i) => (
                  <span key={i} className="lp-shot__chart-bar" style={{ height: `${h}%` }} />
                ))}
              </span>
            </div>
            <div className="lp-rows">
              {rows.map((r) => (
                <div key={r.name} className="lp-row">
                  <span className="lp-row__avatar">{r.name.charAt(0)}</span>
                  <span className="lp-row__meta">
                    <span className="lp-row__name">{r.name}</span>
                    <span className="lp-row__sub">{r.sub}</span>
                  </span>
                  <span className={`lp-pill lp-pill--${r.tone}`}>{r.status}</span>
                </div>
              ))}
            </div>
            <div className="lp-shot__plan">
              <span className="lp-shot__plan-label">Sessions used</span>
              <span className="lp-shot__track">
                <span className="lp-shot__track-fill" />
              </span>
              <span className="lp-shot__plan-num">8 / 12</span>
            </div>
          </div>
        </div>
      </div>
      <p className="lp-shot__caption">Product preview — illustrative interface</p>
    </div>
  );
}

function Hero() {
  return (
    <section className="lp-hero">
      <div className="lp-container lp-hero__grid">
        <Reveal className="lp-hero__copy">
          <span className="lp-eyebrow">
            <Dumbbell size={14} aria-hidden="true" />
            For gym owners &amp; trainers
          </span>
          <h1 className="lp-hero__title">
            Run your <span className="lp-hero__accent">gym smarter</span>.
          </h1>
          <p className="lp-hero__desc">
            Manage members, trainers, subscriptions, and daily gym operations from one place.
          </p>
          <div className="lp-hero__ctas">
            <Link to="/apply" className="lp-btn lp-btn--primary lp-btn--lg">
              Become a Gym Owner
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link to="/login" className="lp-btn lp-btn--secondary lp-btn--lg">
              Sign In
            </Link>
          </div>
          <div className="lp-hero__chips">
            <span className="lp-hero__chip">
              <Check size={16} aria-hidden="true" />
              Secure
            </span>
            <span className="lp-hero__chip">
              <Check size={16} aria-hidden="true" />
              Simple
            </span>
            <span className="lp-hero__chip">
              <Check size={16} aria-hidden="true" />
              Built for growth
            </span>
          </div>
          <p className="lp-hero__note">
            Apply as an owner — your first gym is created as soon as your application is approved.
          </p>
        </Reveal>
        <Reveal className="lp-hero__shot" delay={120}>
          <DashboardShot />
        </Reveal>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className="lp-section" id="features">
      <div className="lp-container">
        <Reveal className="lp-head">
          <span className="lp-eyebrow">Features</span>
          <h2 className="lp-head__title">Everything your gym needs.</h2>
          <p className="lp-head__desc">Members, trainers, plans, and access — in one clean platform.</p>
        </Reveal>
        <div className="lp-bento">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} className={f.wide ? 'lp-card--w2' : undefined} delay={(i % 3) * 70}>
              <article className={f.tint ? 'lp-card lp-card--tint' : 'lp-card'}>
                <span className={`lp-card__icon lp-card__icon--${f.tone}`} aria-hidden="true">
                  <f.icon size={24} />
                </span>
                <h3 className="lp-card__title">{f.title}</h3>
                <p className="lp-card__desc">{f.desc}</p>
                {f.points.length > 0 && (
                  <ul className="lp-card__points">
                    {f.points.map((p) => (
                      <li key={p}>
                        <Check size={16} aria-hidden="true" />
                        {p}
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="lp-section lp-section--alt" id="how-it-works">
      <div className="lp-container">
        <Reveal className="lp-head">
          <span className="lp-eyebrow">How it works</span>
          <h2 className="lp-head__title">Get your gym up and running.</h2>
        </Reveal>
        <div className="lp-steps">
          {STEPS.map((s, i) => (
            <Reveal key={s.num} delay={i * 90}>
              <div className="lp-step">
                <span className="lp-step__num" aria-hidden="true">
                  {s.num}
                </span>
                <h3 className="lp-step__title">{s.title}</h3>
                <p className="lp-step__desc">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Roles() {
  return (
    <section className="lp-section" id="roles">
      <div className="lp-container">
        <Reveal className="lp-head">
          <span className="lp-eyebrow">Roles</span>
          <h2 className="lp-head__title">One platform. Three roles.</h2>
          <p className="lp-head__desc">Every role gets its own workspace, enforced by the server.</p>
        </Reveal>
        <div className="lp-roles">
          {ROLES.map((r, i) => (
            <Reveal key={r.title} delay={i * 90}>
              <article className="lp-role">
                <span className={`lp-role__icon lp-role__icon--${r.tone}`} aria-hidden="true">
                  <r.icon size={24} />
                </span>
                <h3 className="lp-role__title">{r.title}</h3>
                <p className="lp-role__desc">{r.desc}</p>
                <div className="lp-role__chips">
                  {r.chips.map((c) => (
                    <span key={c} className="lp-chip">
                      {c}
                    </span>
                  ))}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const TRUST = [
  {
    icon: KeyRound,
    title: 'Secure Authentication',
    desc: 'JWT authentication with refresh token sessions.',
  },
  {
    icon: ShieldCheck,
    title: 'Role-Based Access',
    desc: 'Access is controlled by user role and resource ownership.',
  },
  {
    icon: CreditCard,
    title: 'Flexible Memberships',
    desc: 'Support time-based and session-based membership plans.',
  },
  {
    icon: Building2,
    title: 'Multi-Gym Management',
    desc: 'Owners can manage multiple gyms from one platform.',
  },
];

const TECH = ['ASP.NET Core', 'React', 'SQL Server', 'EF Core', 'TypeScript'];

function Trust() {
  return (
    <section className="lp-section lp-section--alt">
      <div className="lp-container">
        <Reveal className="lp-head">
          <span className="lp-eyebrow">Why GymMaster</span>
          <h2 className="lp-head__title">Built for modern gym operations.</h2>
        </Reveal>
        <div className="lp-trust">
          {TRUST.map((t, i) => (
            <Reveal key={t.title} delay={(i % 2) * 80}>
              <div className="lp-trust-item">
                <span className="lp-trust-item__icon" aria-hidden="true">
                  <t.icon size={22} />
                </span>
                <span>
                  <h3 className="lp-trust-item__title">{t.title}</h3>
                  <p className="lp-trust-item__desc">{t.desc}</p>
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Tech() {
  return (
    <section className="lp-section lp-section--tight">
      <div className="lp-container">
        <Reveal>
          <div className="lp-tech">
            <span className="lp-tech__label">Built with</span>
            <div className="lp-tech__row">
              {TECH.map((t) => (
                <span key={t} className="lp-tech__item">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="lp-section" style={{ paddingTop: 0 }}>
      <div className="lp-container">
        <Reveal>
          <div className="lp-cta-panel">
            <h2>Ready to run your gym smarter?</h2>
            <p>Manage your gym operations with GymMaster.</p>
            <div className="lp-cta-actions">
              <Link to="/apply" className="lp-btn lp-btn--white lp-btn--lg">
                Become a Gym Owner
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="lp-footer">
      <div className="lp-container">
        <div className="lp-footer__grid">
          <div>
            <Link to="/" className="lp-brand" aria-label="GymMaster home">
              <BrandLogo size={30} />
              <span>GymMaster</span>
            </Link>
            <p className="lp-footer__tag">The platform for modern gym operations.</p>
          </div>
          <nav aria-label="Product">
            <h3 className="lp-footer__col-title">Product</h3>
            <div className="lp-footer__links">
              <a href="#features">Features</a>
              <a href="#how-it-works">How it works</a>
              <a href="#roles">Roles</a>
            </div>
          </nav>
          <nav aria-label="Account">
            <h3 className="lp-footer__col-title">Account</h3>
            <div className="lp-footer__links">
              <Link to="/login">Sign in</Link>
              <Link to="/apply">Become a Gym Owner</Link>
            </div>
          </nav>
        </div>
        <div className="lp-footer__bottom">
          <span>© {year} GymMaster</span>
        </div>
      </div>
    </footer>
  );
}

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="lp-root">
      <a className="lp-skip" href="#lp-main">
        Skip to content
      </a>
      <Navbar
        menuOpen={menuOpen}
        onToggleMenu={() => setMenuOpen((open) => !open)}
        onCloseMenu={() => setMenuOpen(false)}
      />
      <main id="lp-main">
        <Hero />
        <Features />
        <HowItWorks />
        <Roles />
        <Trust />
        <Tech />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
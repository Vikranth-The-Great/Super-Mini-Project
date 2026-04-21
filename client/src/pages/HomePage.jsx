import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Chatbot from '../components/Chatbot';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <div>
      <Navbar />

      {/* Hero */}
      <section className="hero">
        <h1>{t('home_hero_title')}</h1>
        <p>
          {t('home_hero_desc')}
        </p>
        <div className="hero-cta-row">
          <Link to="/donate">
            <button className="btn-primary hero-cta-primary">
              {t('home_cta_donate_now')}
            </button>
          </Link>
          <Link to="/find-food">
            <button className="btn-secondary hero-cta-secondary">
              {t('home_cta_find_food')}
            </button>
          </Link>
        </div>
      </section>

      {/* Impact */}
      <section className="page-container">
        <h2 className="impact-title">{t('home_impact_title')}</h2>
        <div className="stats-grid impact-wrap">
          <div className="stat-box"><h3>500+</h3><p>{t('home_impact_meals')}</p></div>
          <div className="stat-box"><h3>50+</h3><p>{t('home_impact_volunteers')}</p></div>
          <div className="stat-box"><h3>20+</h3><p>{t('home_impact_locations')}</p></div>
        </div>
      </section>

      {/* How it works */}
      <section className="steps-section">
        <div className="page-container">
          <h2 className="impact-title">{t('home_steps_title')}</h2>
          <div className="steps-grid">
            <Step num="1" title={t('home_step1_title')} desc={t('home_step1_desc')} />
            <Step num="2" title={t('home_step2_title')} desc={t('home_step2_desc')} />
            <Step num="3" title={t('home_step3_title')} desc={t('home_step3_desc')} />
            <Step num="4" title={t('home_step4_title')} desc={t('home_step4_desc')} />
          </div>
        </div>
      </section>

      <Chatbot />
      <Footer />
    </div>
  );
}

function Step({ num, title, desc }) {
  return (
    <div className="card step-card">
      <div className="step-badge">
        {num}
      </div>
      <h4>{title}</h4>
      <p>{desc}</p>
    </div>
  );
}

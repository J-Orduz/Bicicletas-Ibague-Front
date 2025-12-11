import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Hyperspeed from './Hyperspeed';
import './Landing.scss';
import logo from '/logo_bicibague.png';

const landingPreset = {
  // Highway-like preset with warm orange/red colors
  distortion: 'turbulentDistortion',
  lanesPerRoad: 3,
  lightPairsPerRoadWay: 40,
  totalSideLightSticks: 30,
  colors: {
    // road/island/background keep dark so lights pop
    roadColor: 0x0b0b0b,
    islandColor: 0x0a0a0a,
    background: 0x000000,
    shoulderLines: 0x1a1a1a,
    brokenLines: 0x1a1a1a,
    // warm orange/red for left cars, yellows/oranges for right for contrast
    leftCars: [0xff5f3b, 0xff8a3d, 0xffb86b],
    rightCars: [0xff102a, 0xe74d3c, 0xff7a59],
    sticks: 0xff7a59,
  },
};

const Landing = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <main className="landing-root">
      <header className="landing-header">
        <div className="header-left">Bicibague</div>
        <nav className="header-right">
          <button className="header-link" onClick={() => navigate('/login')}>
            {t('auth.login')}
          </button>
          <button className="header-cta" onClick={() => navigate('/register')}>
            {t('auth.register')}
          </button>
        </nav>
      </header>

      <div className="landing-hyperspeed">
        <Hyperspeed effectOptions={landingPreset} />
      </div>

      <div className="landing-hero">
        <div className="hero-inner">
          <img src={logo} alt="BicIbagué Logo" className="hero-logo" />
          <h1 className="hero-title">{t('landing.heroTitle')}</h1>
          <p className="hero-sub">{t('landing.heroSubtitle')}</p>
          <div className="hero-actions">
            <button
              className="btn primary"
              onClick={() => navigate('/register')}
            >
              {t('landing.createAccount')}
            </button>
            <button className="btn ghost">{t('landing.learnMore')}</button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Landing;

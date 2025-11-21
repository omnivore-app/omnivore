// Landing page component for Omnivore Vite app
// Replicates the legacy landing page structure exactly

import React from 'react'
import { Link } from 'react-router-dom'

const LandingPage: React.FC = () => {
  const sections = [
    {
      titleText: 'Save it now. Read it later.',
      descriptionText:
        'Save articles and PDFs as you come across them using Omnivore\'s mobile apps and browser extensions. Read them later using our distraction free reader.',
      image: '/static/images/landing/landing-01-save-it-now.png',
      imagePosition: 'right' as const,
    },
    {
      titleText: 'Get all your RSS feeds and newsletters in one place.',
      descriptionText:
        'Send newsletters directly to your Omnivore library rather than scattered across multiple inboxes. Read them on your own time, away from the constant distractions and interruptions of your email.',
      image: '/static/images/landing/landing-02-newsletters.png',
      imagePosition: 'left' as const,
    },
    {
      titleText: 'Keep your reading organized, whatever that means to you.',
      descriptionText:
        'Keep your reading organized and easily available with labels, filters, rules, and full text searches. We\'re not here to tell you how to stay organized — our job is to give you the tools to build a system that works for you.',
      image: '/static/images/landing/landing-03-organisation.png',
      imagePosition: 'right' as const,
    },
    {
      titleText: 'Add highlights and notes.',
      descriptionText:
        'Highlight key sections and add notes as you read. You can access your highlights and notes any time — they stay with your articles forever.',
      image: '/static/images/landing/landing-04-highlights-and-notes.png',
      imagePosition: 'left' as const,
    },
    {
      titleText: 'Sync with your second brain.',
      descriptionText:
        'Omnivore syncs with popular Personal Knowledge Management systems including Logseq, Obsidian, and Notion, so you can pull all your saved reading, highlights, and notes into your second brain.',
      image: '/static/images/landing/landing-05-sync.png',
      imagePosition: 'right' as const,
    },
    {
      titleText: 'Listen to your reading with text-to-speech.',
      descriptionText:
        'Work through your to-be-read list and give your eyes a break with text-to-speech, exclusively in the Omnivore app for iOS. Realistic, natural-sounding AI voices will read any saved article aloud.',
      image: '/static/images/landing/landing-06-tts.png',
      imagePosition: 'left' as const,
    },
    {
      titleText: 'Open source means you\'re in control.',
      descriptionText:
        'Reading is a lifetime activity, and you shouldn\'t have to worry you\'ll lose your library after you\'ve spent years building it. Our open-source platform ensures your reading won\'t be held prisoner in a proprietary system.',
      image: '/static/images/landing/landing-07-oss.png',
      imagePosition: 'right' as const,
    },
  ]

  return (
    <div className="landing-page-wrapper">
      {/* Header */}
      <header className="landing-header-wrapper">
        <div className="landing-logo-container">
          <Link to="/login" className="landing-logo-link">
            <img
              src="/static/icons/logo-landing.svg"
              alt="Omnivore Logo"
              className="landing-logo-image"
            />
          </Link>
        </div>
        <Link to="/login" className="landing-login-button">
          Login
        </Link>
      </header>

      {/* Main Content */}
      <main className="landing-main-content">
        <div className="landing-content-container">
          {/* Hero Text Section */}
          <div className="landing-hero-text">
            <h1 className="landing-hero-title">
              Omnivore is the free, open source, read-it-later app for serious
              readers.
            </h1>
            <p className="landing-hero-subtitle">
              Distraction free. Privacy focused. Open source. Designed for
              knowledge workers and lifelong learners.
            </p>
            <p className="landing-hero-description">
              Save articles, newsletters, and documents and read them later —
              focused and distraction free. Add notes and highlights. Organize
              your reading list the way you want and sync it across all your
              devices.
            </p>
            <div className="landing-cta-container">
              <Link to="/register" className="landing-cta-button">
                Sign Up for Free
              </Link>
            </div>
          </div>

          {/* Hero Image */}
          <div className="landing-hero-image-container">
            <img
              src="/static/images/landing/landing-00-hero.png"
              alt="Omnivore Hero"
              className="landing-hero-image"
            />
          </div>

          {/* Feature Sections */}
          <div className="landing-sections-container">
            {sections.map((section, index) => (
              <div
                key={index}
                className={`landing-section ${
                  section.imagePosition === 'left'
                    ? 'landing-section-image-left'
                    : 'landing-section-image-right'
                }`}
              >
                <div className="landing-section-text">
                  <h2 className="landing-section-title">{section.titleText}</h2>
                  <p className="landing-section-description">
                    {section.descriptionText}
                  </p>
                </div>
                <div className="landing-section-image-wrapper">
                  <img
                    src={section.image}
                    alt={section.titleText}
                    className="landing-section-image"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="landing-footer-wrapper">
        <div className="landing-footer-container">
          <div className="landing-footer-column">
            <h3 className="landing-footer-title">Install</h3>
            <ul className="landing-footer-list">
              <li>
                <a href="https://omnivore.app/install/ios">iOS</a>
              </li>
              <li>
                <a href="https://omnivore.app/install/macos">macOS</a>
              </li>
              <li>
                <a href="https://omnivore.app/install/android">
                  Android (preview release)
                </a>
              </li>
              <li>
                <a href="https://omnivore.app/install/chrome">
                  Chrome Extension
                </a>
              </li>
              <li>
                <a href="https://omnivore.app/install/firefox">
                  Firefox Extension
                </a>
              </li>
              <li>
                <a href="https://omnivore.app/install/safari">
                  Safari Extension
                </a>
              </li>
              <li>
                <a href="https://omnivore.app/install/edge">Edge Extension</a>
              </li>
            </ul>
          </div>
          <div className="landing-footer-column">
            <h3 className="landing-footer-title">About</h3>
            <ul className="landing-footer-list">
              <li>
                <a href="https://docs.omnivore.app/about/pricing">Pricing</a>
              </li>
              <li>
                <a href="https://docs.omnivore.app/about/privacy-statement">
                  Privacy
                </a>
              </li>
              <li>
                <a href="mailto:feedback@omnivore.app">
                  Contact us via email
                </a>
              </li>
              <li>
                <a href="https://discord.gg/h2z5rppzz9">
                  Join our community on Discord
                </a>
              </li>
              <li>
                <a href="https://github.com/omnivore-app/omnivore/blob/main/SECURITY.md">
                  Security
                </a>
              </li>
              <li>
                <a href="https://docs.omnivore.app">Read our Docs</a>
              </li>
            </ul>
          </div>
          <div className="landing-footer-column">
            <h3 className="landing-footer-title">Follow</h3>
            <ul className="landing-footer-list">
              <li>
                <a href="https://twitter.com/OmnivoreApp">Twitter</a>
              </li>
              <li>
                <a href="https://pkm.social/@omnivore">Mastodon</a>
              </li>
              <li>
                <a href="https://blog.omnivore.app">Blog</a>
              </li>
              <li>
                <a href="https://github.com/omnivore-app/omnivore">GitHub</a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage

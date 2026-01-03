import './PrivacyBanner.css';

export function PrivacyBanner() {
  return (
    <div className="privacy-banner">
      <div className="privacy-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      </div>
      <div className="privacy-content">
        <strong>100% Private & Secure</strong>
        <span>Your PDFs never leave your device. All processing happens locally in your browser.</span>
      </div>
    </div>
  );
}

export function PrivacyFeatures() {
  const features = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          <polyline points="9 12 12 15 17 9"></polyline>
        </svg>
      ),
      title: 'No Server Uploads',
      description: 'Your documents are never sent to any server. Zero data transmission means zero risk.',
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      ),
      title: 'Browser-Based Processing',
      description: 'All PDF parsing and comparison happens entirely within your browser using JavaScript.',
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="4 17 10 11 4 5"></polyline>
          <line x1="12" y1="19" x2="20" y2="19"></line>
        </svg>
      ),
      title: 'CLI Available',
      description: 'Use pdf-diff from your terminal with npx. Perfect for CI/CD pipelines.',
      link: '/cli.html',
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="2" y1="12" x2="22" y2="12"></line>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
      ),
      title: 'Works Offline',
      description: 'Once loaded, the app works completely offline. No internet connection required.',
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="9" y1="15" x2="15" y2="15"></line>
        </svg>
      ),
      title: 'Open Source',
      description: 'Our code is open source. Inspect it yourself to verify our privacy claims.',
    },
  ];

  return (
    <div className="privacy-features">
      <h2 className="privacy-features-title">Why Choose PDF Diff?</h2>
      <div className="privacy-features-grid">
        {features.map((feature, index) => (
          <div key={index} className={`privacy-feature${feature.link ? ' privacy-feature-link' : ''}`}>
            {feature.link ? (
              <a href={feature.link} className="feature-link-wrapper">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <span className="feature-learn-more">Learn more →</span>
              </a>
            ) : (
              <>
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

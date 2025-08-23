import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      {/* Hero Section with Video Background */}
      <div className="hero-section">
        <video autoPlay loop muted playsInline className="hero-video">
          <source src="/hero-video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="hero-content">
          <h1 className="hero-title">Welcome to PÜPER</h1>
          <p className="hero-subtitle">Find public restrooms with ease.</p>
          <Link to="/map" className="hero-button">Find a Restroom</Link>
        </div>
      </div>

    </div>
  );
};

export default HomePage;

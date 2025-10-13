import { useEffect, useState } from "react";

export const LoadingSpinner = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="splash-container">
      {/* Animated Background */}
      <div className="splash-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
        <div className="grid-overlay"></div>
      </div>

      {/* Main Content */}
      <div className="splash-content">
        {/* Logo/Brand Section */}
        <div className="logo-section">
          <div className="logo-ring">
            <div className="logo-ring-inner"></div>
          </div>
          <h1 className="brand-name">
            <span className="brand-letter">C</span>
            <span className="brand-letter">R</span>
            <span className="brand-letter">A</span>
            <span className="brand-letter">Z</span>
            <span className="brand-letter">Y</span>
          </h1>
          <p className="brand-tagline">50x to the moon</p>
        </div>

        {/* Loading Bar */}
        <div className="loading-section">
          <div className="loading-bar-container">
            <div className="loading-bar" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="loading-text">{progress}%</div>
        </div>

        {/* Floating Particles */}
        <div className="particles">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            ></div>
          ))}
        </div>
      </div>

      <style>
        {`
          .splash-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            overflow: hidden;
            z-index: 9999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }

          /* Animated Background */
          .splash-background {
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
            overflow: hidden;
          }

          .gradient-orb {
            position: absolute;
            border-radius: 50%;
            filter: blur(80px);
            opacity: 0.6;
            animation: float 8s ease-in-out infinite;
          }

          .orb-1 {
            width: 400px;
            height: 400px;
            background: radial-gradient(circle, rgba(129, 140, 248, 0.4) 0%, transparent 70%);
            top: -10%;
            left: -10%;
            animation-delay: 0s;
          }

          .orb-2 {
            width: 500px;
            height: 500px;
            background: radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 70%);
            bottom: -15%;
            right: -15%;
            animation-delay: 2s;
          }

          .orb-3 {
            width: 350px;
            height: 350px;
            background: radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%);
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            animation-delay: 4s;
          }

          .grid-overlay {
            position: absolute;
            inset: 0;
            background-image: 
              linear-gradient(rgba(81, 72, 107, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(81, 72, 107, 0.1) 1px, transparent 1px);
            background-size: 50px 50px;
            animation: gridMove 20s linear infinite;
          }

          @keyframes float {
            0%, 100% {
              transform: translate(0, 0) scale(1);
            }
            33% {
              transform: translate(30px, -30px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
          }

          @keyframes gridMove {
            0% {
              transform: translate(0, 0);
            }
            100% {
              transform: translate(50px, 50px);
            }
          }

          /* Main Content */
          .splash-content {
            position: relative;
            z-index: 2;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            padding: 20px;
          }

          /* Logo Section */
          .logo-section {
            text-align: center;
            margin-bottom: 60px;
          }

          .logo-ring {
            width: 120px;
            height: 120px;
            margin: 0 auto 30px;
            position: relative;
            animation: pulse 2s ease-in-out infinite;
          }

          .logo-ring::before {
            content: '';
            position: absolute;
            inset: -4px;
            border-radius: 50%;
            background: linear-gradient(45deg, #818cf8, #a855f7, #3b82f6, #818cf8);
            background-size: 200% 200%;
            animation: gradientRotate 3s linear infinite;
            z-index: -1;
          }

          .logo-ring-inner {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: #0a0a0a;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
          }

          .logo-ring-inner::before {
            content: '';
            position: absolute;
            width: 80%;
            height: 80%;
            border-radius: 50%;
            background: linear-gradient(135deg, rgba(129, 140, 248, 0.3), rgba(168, 85, 247, 0.3));
            animation: spin 4s linear infinite;
          }

          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.05);
            }
          }

          @keyframes gradientRotate {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }

          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }

          /* Brand Name */
          .brand-name {
            font-size: 72px;
            font-weight: 900;
            margin: 0 0 15px;
            letter-spacing: 8px;
            display: flex;
            gap: 8px;
            justify-content: center;
          }

          .brand-letter {
            display: inline-block;
            background: linear-gradient(135deg, #818cf8, #a855f7, #3b82f6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: letterFloat 2s ease-in-out infinite;
            text-shadow: 0 0 30px rgba(129, 140, 248, 0.5);
          }

          .brand-letter:nth-child(1) { animation-delay: 0s; }
          .brand-letter:nth-child(2) { animation-delay: 0.1s; }
          .brand-letter:nth-child(3) { animation-delay: 0.2s; }
          .brand-letter:nth-child(4) { animation-delay: 0.3s; }
          .brand-letter:nth-child(5) { animation-delay: 0.4s; }

          @keyframes letterFloat {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-10px);
            }
          }

          .brand-tagline {
            font-size: 18px;
            color: rgba(255, 255, 255, 0.6);
            margin: 0;
            letter-spacing: 4px;
            text-transform: uppercase;
            animation: fadeInOut 2s ease-in-out infinite;
          }

          @keyframes fadeInOut {
            0%, 100% {
              opacity: 0.6;
            }
            50% {
              opacity: 1;
            }
          }

          /* Loading Section */
          .loading-section {
            width: 100%;
            max-width: 400px;
          }

          .loading-bar-container {
            width: 100%;
            height: 4px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            overflow: hidden;
            position: relative;
            margin-bottom: 15px;
          }

          .loading-bar {
            height: 100%;
            background: linear-gradient(90deg, #818cf8, #a855f7, #3b82f6);
            border-radius: 10px;
            transition: width 0.3s ease;
            position: relative;
            box-shadow: 0 0 20px rgba(129, 140, 248, 0.8);
          }

          .loading-bar::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
            animation: shimmer 1.5s infinite;
          }

          @keyframes shimmer {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }

          .loading-text {
            text-align: center;
            color: rgba(255, 255, 255, 0.8);
            font-size: 14px;
            font-weight: 600;
            letter-spacing: 2px;
          }

          /* Particles */
          .particles {
            position: absolute;
            inset: 0;
            pointer-events: none;
            overflow: hidden;
          }

          .particle {
            position: absolute;
            width: 3px;
            height: 3px;
            background: rgba(129, 140, 248, 0.8);
            border-radius: 50%;
            animation: particleFloat linear infinite;
            box-shadow: 0 0 10px rgba(129, 140, 248, 0.8);
          }

          @keyframes particleFloat {
            0% {
              transform: translateY(100vh) scale(0);
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            90% {
              opacity: 1;
            }
            100% {
              transform: translateY(-100px) scale(1);
              opacity: 0;
            }
          }

          /* Responsive Design */
          @media (max-width: 768px) {
            .brand-name {
              font-size: 48px;
              letter-spacing: 4px;
              gap: 4px;
            }

            .brand-tagline {
              font-size: 14px;
              letter-spacing: 2px;
            }

            .logo-ring {
              width: 80px;
              height: 80px;
            }

            .loading-section {
              max-width: 300px;
            }
          }
        `}
      </style>
    </div>
  );
};


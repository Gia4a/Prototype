import React from 'react';

interface StarButtonProps {
  onClick: () => void;
  className?: string;
}

const StarButton: React.FC<StarButtonProps> = ({ onClick, className = '' }) => {
  return (
    <div className={`daily-horoscope-container ${className}`}>
      <div className="daily-horoscope-button" onClick={onClick}>
        <div className="star-shape">
          <div className="spinning-text">
            <span>A</span>
            <span>S</span>
            <span>T</span>
            <span>R</span>
            <span>O</span>
            <span>•</span>
            <span>C</span>
            <span>O</span>
            <span>C</span>
            <span>K</span>
            <span>T</span>
            <span>A</span>
            <span>I</span>
            <span>L</span>
            <span>S</span>
            <span>•</span>
            <span>✨</span>
          </div>
          <div className="center-icon">Zodicups</div>
        </div>
      </div>
    </div>
  );
};

export default StarButton;
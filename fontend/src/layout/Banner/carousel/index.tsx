import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames/bind';
import styles from './Carousel.module.scss';

const cx = classNames.bind(styles);

export interface CarouselSlide {
  title: string;
  description: string;
  buttonText: string;
  buttonLink?: string;
  items: {
    image: string;
    label: string;
    link?: string;
  }[];
  backgroundColor?: string;
}

export interface CarouselProps {
  slides: CarouselSlide[];
  autoPlay?: boolean;
  interval?: number;
  showArrows?: boolean;
  showIndicators?: boolean;
}

export const Carousel: React.FC<CarouselProps> = ({
  slides,
  autoPlay = true,
  interval = 5000,
  showArrows = true,
  showIndicators = true
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (!autoPlay || slides.length <= 1) return;
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoPlay, interval, slides.length]);

  if (slides.length === 0) return null;

  const current = slides[currentIndex];

  return (
    <div
      className={cx('carousel')}
      style={{ backgroundColor: current.backgroundColor || '#00b9c6' }}
    >
      {/* Slide Content */}
      <div className={cx('content')}>
        <div className={cx('left')}>
          <h2>{current.title}</h2>
          <p>{current.description}</p>
          <a href={current.buttonLink || '#'} className={cx('cta')}>
            {current.buttonText}
          </a>
        </div>

        <div className={cx('right')}>
          {current.items.map((item, idx) => (
            <div key={idx} className={cx('item')}>
              <img src={item.image} alt={item.label} />
              <a href={item.link || '#'}>{item.label} ›</a>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      {showArrows && slides.length > 1 && (
        <div className={cx('arrows')}>
          <button onClick={prevSlide} aria-label="Previous Slide">❮</button>
          <button onClick={nextSlide} aria-label="Next Slide">❯</button>
        </div>
      )}

      {/* Indicators */}
      {showIndicators && slides.length > 1 && (
        <div className={cx('indicators')}>
          {slides.map((_, index) => (
            <button
              key={index}
              className={cx({ active: index === currentIndex })}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

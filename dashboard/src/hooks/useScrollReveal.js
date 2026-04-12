import { useRef, useEffect } from 'react';

const useScrollReveal = (options = {}) => {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      },
      { threshold: options.threshold || 0.1 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return ref;
};

export default useScrollReveal;

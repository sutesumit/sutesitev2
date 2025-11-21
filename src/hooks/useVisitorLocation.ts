import { useState, useEffect } from 'react';

export const useVisitorLocation = () => {
  const [visitorLocation, setVisitorLocation] = useState('world');

  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(response => response.json())
      .then(data => {
        if (data.city && data.country_name) {
          setVisitorLocation(`${data.city}, ${data.country_name}`);
        } else if (data.country_name) {
          setVisitorLocation(`${data.country_name}`);
        }
      })
      .catch(error => {
        console.error('Error fetching location:', error);
      });
  }, []);

  return visitorLocation;
};

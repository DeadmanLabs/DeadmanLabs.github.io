import React, { useState, useEffect } from 'react';
import { FaTwitter, FaLinkedin, FaGithub } from 'react-icons/fa';

const Footer: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentDate.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <footer className="bg-gray-900 text-white flex justify-between items-center h-16 fixed bottom-0 left-0 right-0 z-10">
      <div className="flex h-full items-center">
        <a href="https://x.com/KronosKorpse" target="_blank" rel="noopener noreferrer" className="flex items-center hover:bg-gray-700 rounded-lg h-full mr-2 px-4">
          <FaTwitter className="h-6 w-6 mx-2" />
          <span className="hidden md:block">Twitter</span>
        </a>
        <a href="https://www.linkedin.com/in/michael-magahey-5b76b41a0/" target="_blank" rel="noopener noreferrer" className="flex items-center hover:bg-gray-700 rounded-lg h-full mr-2 px-4">
          <FaLinkedin className="h-6 w-6 mx-2" />
          <span className="hidden md:block">LinkedIn</span>
        </a>
        <a href="https://github.com/DeadmanLabs" target="_blank" rel="noopener noreferrer" className="flex items-center hover:bg-gray-700 rounded-lg h-full mr-2 px-4">
          <FaGithub className="h-6 w-6 mx-2" />
          <span className="hidden md:block">GitHub</span>
        </a>
      </div>
      <div className="mr-4">
        {formattedDate}
      </div>
    </footer>
  );
};

export default Footer;

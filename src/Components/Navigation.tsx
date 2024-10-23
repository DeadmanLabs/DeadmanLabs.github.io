import React from 'react';
import { NavLink } from 'react-router-dom';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

import HomeIcon from '../Resources/Icons/HomeN.png';
import BlogIcon from '../Resources/Icons/BlogN.png';
import ClawIcon from '../Resources/Icons/ClawN.png';
import InvestIcon from '../Resources/Icons/StockN.png';
import CasinoIcon from '../Resources/Icons/CasinoN.png';
import LakeIcon from '../Resources/Icons/LakeN.png';
import ProjectsIcon from '../Resources/Icons/ProjectsN.png';
import ContactIcon from '../Resources/Icons/ContactN.png';
import AboutIcon from '../Resources/Icons/AboutN.png';
import AdminIcon from '../Resources/Icons/AccountN.png';
require('@solana/wallet-adapter-react-ui/styles.css');

const Navigation: React.FC = () => {
  return (
    <nav className="bg-gray-900 text-white flex justify-between items-center h-16">
      <div className="flex h-full">
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive
              ? "flex items-center bg-red-700 rounded-lg h-full mr-2 px-4"
              : "flex items-center hover:bg-gray-700 rounded-lg h-full mr-2 px-4"
          }
        >
          <img src={HomeIcon} alt="Home" className="h-6 w-6 mx-2" />
          <span className="hidden md:block">Home</span>
        </NavLink>
        <NavLink
          to="/blog"
          className={({ isActive }) =>
            isActive
              ? "flex items-center bg-red-700 rounded-lg h-full mr-2 px-4"
              : "flex items-center hover:bg-gray-700 rounded-lg h-full mr-2 px-4"
          }
        >
          <img src={BlogIcon} alt="Blog" className="h-6 w-6 mx-2" />
          <span className="hidden md:block">Blog</span>
        </NavLink>
        <NavLink
          to="/claw"
          className={({ isActive }) =>
            isActive
              ? "flex items-center bg-red-700 rounded-lg h-full mr-2 px-4"
              : "flex items-center hover:bg-gray-700 rounded-lg h-full mr-2 px-4"
          }
        >
          <img src={ClawIcon} alt="Claw" className="h-6 w-6 mx-2" />
          <span className="hidden md:block">Claw</span>
        </NavLink>
        <NavLink
          to="/invest"
          className={({ isActive }) =>
            isActive
              ? "flex items-center bg-red-700 rounded-lg h-full mr-2 px-4"
              : "flex items-center hover:bg-gray-700 rounded-lg h-full mr-2 px-4"
          }
        >
          <img src={InvestIcon} alt="Invest" className="h-6 w-6 mx-2" />
          <span className="hidden md:block">Invest</span>
        </NavLink>
        <NavLink
          to="/casino"
          className={({ isActive }) =>
            isActive
              ? "flex items-center bg-red-700 rounded-lg h-full mr-2 px-4"
              : "flex items-center hover:bg-gray-700 rounded-lg h-full mr-2 px-4"
          }
        >
          <img src={CasinoIcon} alt="Casino" className="h-6 w-6 mx-2" />
          <span className="hidden md:block">Casino</span>
        </NavLink>
        <NavLink
          to="/lake"
          className={({ isActive }) =>
            isActive
              ? "flex items-center bg-red-700 rounded-lg h-full mr-2 px-4"
              : "flex items-center hover:bg-gray-700 rounded-lg h-full mr-2 px-4"
          }
        >
          <img src={LakeIcon} alt="Lake" className="h-6 w-6 mx-2" />
          <span className="hidden md:block">Lake</span>
        </NavLink>
        <NavLink
          to="/projects"
          className={({ isActive }) =>
            isActive
              ? "flex items-center bg-red-700 rounded-lg h-full mr-2 px-4"
              : "flex items-center hover:bg-gray-700 rounded-lg h-full mr-2 px-4"
          }
        >
          <img src={ProjectsIcon} alt="Projects" className="h-6 w-6 mx-2" />
          <span className="hidden md:block">Projects</span>
        </NavLink>
        <NavLink
          to="/contact"
          className={({ isActive }) =>
            isActive
              ? "flex items-center bg-red-700 rounded-lg h-full mr-2 px-4"
              : "flex items-center hover:bg-gray-700 rounded-lg h-full mr-2 px-4"
          }
        >
          <img src={ContactIcon} alt="Contact" className="h-6 w-6 mx-2" />
          <span className="hidden md:block">Contact</span>
        </NavLink>
        <NavLink
          to="/about"
          className={({ isActive }) =>
            isActive
              ? "flex items-center bg-red-700 rounded-lg h-full mr-2 px-4"
              : "flex items-center hover:bg-gray-700 rounded-lg h-full mr-2 px-4"
          }
        >
          <img src={AboutIcon} alt="About" className="h-6 w-6 mx-2" />
          <span className="hidden md:block">About</span>
        </NavLink>
      </div>
      <div className="mr-4">
        <WalletMultiButton />
      </div>
    </nav>
  );
};

export default Navigation;
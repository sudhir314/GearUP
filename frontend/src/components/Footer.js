import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8 mt-auto border-t border-gray-800">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-center md:text-left">
            <h3 className="font-bold text-lg tracking-wide">Mobile Gear</h3>
            <p className="text-gray-400 text-xs mt-1">Premium Accessories for your device.</p>
        </div>
        <p className="text-sm text-gray-500 font-medium tracking-wide">
          © {new Date().getFullYear()} Mobile Gear. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
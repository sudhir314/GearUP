import React from 'react';
import { Bell } from 'lucide-react'; // Import Bell icon for consistency

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8 mt-auto border-t border-gray-800">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Brand Section */}
        <div className="text-center md:text-left flex flex-col items-center md:items-start">
            
            {/* --- STEP 4: FOOTER TEXT LOGO --- */}
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-logo" style={{color: 'white', fontSize: '2rem'}}>
                Gear <span style={{color: '#60A5FA'}}>UP</span>
              </h3>
              <Bell className="w-5 h-5 text-blue-400 -mt-2 -rotate-12" fill="currentColor"/>
            </div>
            {/* -------------------------------- */}

            <p className="text-gray-400 text-xs">Premium Accessories for your device.</p>
        </div>

        {/* Copyright Section */}
        <p className="text-sm text-gray-500 font-medium tracking-wide">
          © {new Date().getFullYear()} GearUP. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
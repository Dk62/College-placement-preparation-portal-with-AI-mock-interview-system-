import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, HelpCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#1e3a8a] text-white pt-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Column 1: Institutional Branding */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-blue text-[#1e3a8a] rounded-full flex items-center justify-center font-bold text-xl">
                <img src="/media/logo.png" alt="Logo" className="w-8 h-8 object-contain" onError={(e) => e.target.style.display = 'none'} />
              </div>
              <span className="font-bold text-2xl tracking-wide">CPPP</span>
            </div>
            <h3 className="font-semibold text-lg text-blue-200">College Placement Preparation Portal</h3>
            <p className="text-blue-100 text-sm">
              Empowering students for a brighter professional future.
            </p>
            <div className="inline-block px-3 py-1 bg-[#1e40af] rounded-full text-xs font-semibold border border-blue-500 mt-2">
              Academic Year 2025-26
            </div>
          </div>

          {/* Column 2: Portal Tools */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-blue-200 uppercase tracking-wider text-sm border-b border-blue-700 pb-2">Portal Tools</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/resume-builder" className="text-blue-100 hover:text-white transition-colors text-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span> Resume Builder
                </Link>
              </li>
              <li>
                <Link to="/mock-interview" className="text-blue-100 hover:text-white transition-colors text-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span> Mock Interview System
                </Link>
              </li>
              <li>
                <Link to="/aptitude-test" className="text-blue-100 hover:text-white transition-colors text-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span> Aptitude Test Engine
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Support */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-blue-200 uppercase tracking-wider text-sm border-b border-blue-700 pb-2">Contact & Support</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-blue-100 text-sm">
                <MapPin size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <span>
                  College Campus,<br />
                  India
                </span>
              </li>
              <li className="flex items-center gap-3 text-blue-100 text-sm">
                <Mail size={18} className="text-blue-400 flex-shrink-0" />
                <a href="mailto:support@collegeportal.edu" className="hover:text-white transition-colors">support@collegeportal.edu</a>
              </li>
              <li className="flex items-center gap-3 text-blue-100 text-sm mt-4">
                <HelpCircle size={18} className="text-blue-400 flex-shrink-0" />
                <Link to="#" className="hover:text-white transition-colors font-medium">IT Help Desk</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Developer Credit */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-blue-200 uppercase tracking-wider text-sm border-b border-blue-700 pb-2">Developer Credit</h3>
            <div className="bg-[#1e40af] p-4 rounded-lg border border-blue-700">
              <p className="text-blue-100 text-sm font-medium mb-1">Developed by</p>
              <p className="text-white font-bold text-lg mb-1">Dilkhush Kumar</p>
              <p className="text-blue-300 text-xs mb-4">BCA Final Year</p>
              <div className="flex gap-4">
                <a href="https://www.linkedin.com/in/dilkhush-kumar-950691292/" target="_blank" rel="noopener noreferrer" className="p-2 bg-white text-[#0077b5] rounded-full hover:scale-110 transition-all flex items-center justify-center" title="LinkedIn Profile">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                </a>
                <a href="https://github.com/Dk62" target="_blank" rel="noopener noreferrer" className="p-2 bg-white text-[#24292e] rounded-full hover:scale-110 transition-all flex items-center justify-center" title="GitHub Profile">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12z" /></svg>
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Copyright Bar */}
      <div className="bg-[#172554] py-4 border-t border-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-blue-300 text-sm">
            &copy; {new Date().getFullYear()} College Placement Preparation Portal. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

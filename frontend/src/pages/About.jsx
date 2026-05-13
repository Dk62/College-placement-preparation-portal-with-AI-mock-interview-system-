import React from 'react';
import { Target, Award, Cpu } from 'lucide-react';

const About = () => {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <div className="relative bg-[#1e3a8a] py-20 text-center">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover opacity-20 bg-center"></div>
        <div className="relative max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 uppercase tracking-tight">
            Bridging Talent with Opportunity
          </h1>
          <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto">
            The official College Placement Preparation Portal empowers students to transform knowledge into corporate success through AI evaluation.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">About the Institution</h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              At <strong>GGIMS</strong>, we firmly believe in cultivating holistic professionals capable of solving complex real-world problems. Our curriculum balances strong academic rigor with extensive hands-on experimental knowledge.
            </p>
            <p className="text-gray-600 leading-relaxed">
              The Training & Placement Cell plays a dynamic role in the college, functioning as a critical bridge linking eager intellectual talent with pioneering domestic and global enterprises.
            </p>
          </div>
          <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 grid grid-cols-1 gap-6">
            <div className="flex gap-4">
              <div className="p-3 bg-[#1e3a8a] text-white rounded-2xl h-min"><Target size={24} /></div>
              <div>
                <h4 className="font-bold text-gray-900 text-lg">Our Vision</h4>
                <p className="text-sm text-gray-500 mt-1">To create zero-lag communication channels between academia outputs and global workforce requirements.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="p-3 bg-blue-600 text-white rounded-2xl h-min"><Award size={24} /></div>
              <div>
                <h4 className="font-bold text-gray-900 text-lg">Standard of Excellence</h4>
                <p className="text-sm text-gray-500 mt-1">Ensure 100% student readiness for rigorous selection and screening processes used by fortune 500 leaders.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="p-3 bg-indigo-600 text-white rounded-2xl h-min"><Cpu size={24} /></div>
              <div>
                <h4 className="font-bold text-gray-900 text-lg">AI-Driven Preparation</h4>
                <p className="text-sm text-gray-500 mt-1">Leveraging Google Gemini engines to automate personalized mock interviews, scoring, and predictive aptitude mapping.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 text-center border-t border-gray-100 pt-16">
          <h3 className="text-2xl font-black text-[#1e3a8a] mb-2">Transforming Preparation</h3>
          <p className="text-gray-500 max-w-lg mx-auto">Built using React 18, Node.js ecosystem, and bleeding-edge AI intelligence integration.</p>
        </div>
      </div>
    </div>
  );
};

export default About;

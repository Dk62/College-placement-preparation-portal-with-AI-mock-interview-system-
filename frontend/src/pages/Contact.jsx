import React, { useState } from 'react';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { toast } from 'react-toastify';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const onSubmit = (e) => {
    e.preventDefault();
    toast.success("Message dispatched to the TPO team! We will respond shortly.");
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-5xl w-full grid md:grid-cols-5 bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">

        {/* Left Contact Card */}
        <div className="md:col-span-2 bg-[#1e3a8a] text-white p-10 flex flex-col justify-between relative">
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full translate-x-1/2 translate-y-1/2"></div>
          <div>
            <h2 className="text-3xl font-black mb-2">Contact Info</h2>
            <p className="text-blue-200 text-sm">Have systemic queries or registration blocks? Reach out to us.</p>

            <ul className="mt-10 space-y-6">
              <li className="flex items-center gap-4">
                <div className="p-3 bg-blue-800 rounded-xl"><Phone size={20} /></div>
                <span className="text-sm font-semibold">+91 6206137741</span>
              </li>
              <li className="flex items-center gap-4">
                <div className="p-3 bg-blue-800 rounded-xl"><Mail size={20} /></div>
                <span className="text-sm font-semibold">dk9599093045@gmail.com</span>
              </li>
              <li className="flex items-center gap-4">
                <div className="p-3 bg-blue-800 rounded-xl"><MapPin size={20} /></div>
                <span className="text-sm font-semibold">Placement Cell, Block-A, GGIMS Campus</span>
              </li>
            </ul>
          </div>

          <div className="mt-12 text-xs text-blue-300 font-bold tracking-widest uppercase">
            Authorized Support Only
          </div>
        </div>

        {/* Right Form Card */}
        <div className="md:col-span-3 p-10 lg:p-14">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Send a direct inquiry</h3>
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
                <input
                  type="text" required
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Official Email</label>
                <input
                  type="email" required
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Query/Message</label>
              <textarea
                rows="5" required
                value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                placeholder="Explain the issue or inquiry..."
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#1e3a8a] text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-800 shadow-lg transform hover:-translate-y-0.5 transition-all"
            >
              Send Dispatch
              <Send size={16} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Contact;

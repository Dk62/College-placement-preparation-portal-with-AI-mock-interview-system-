import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const ResumeBuilder = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    phone: '',
    location: '',
    linkedin_link: '',
    github_link: '',
    degree: '',
    branch: '',
    current_semester: '',
    cgpa: '',
    academic_year: '',
    skills: {
      languages: '',
      frontend: '',
      backend: '',
      tools: ''
    },
    projects: [],
    certifications: [],
    objective: '',
    tenth_board: '',
    tenth_percent: '',
    tenth_year: '',
    twelfth_board: '',
    twelfth_percent: '',
    twelfth_year: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'Student') {
      navigate('/dashboard');
      return;
    }

    const fetchProfile = async () => {
      try {
        axios.defaults.withCredentials = true;
        const res = await axios.get('http://localhost:5000/api/profiles/me');
        if (res.data.success) {
          const profile = res.data.data;

          let parsedSkills = { languages: '', frontend: '', backend: '', tools: '' };
          if (profile.skills && typeof profile.skills === 'object' && !Array.isArray(profile.skills)) {
            parsedSkills = { ...parsedSkills, ...profile.skills };
          } else if (Array.isArray(profile.skills)) {
            parsedSkills.languages = profile.skills.join(', '); // fallback for old data
          }

          setFormData({
            phone: profile.phone || '',
            location: profile.location || '',
            linkedin_link: profile.linkedin_link || '',
            github_link: profile.github_link || '',
            degree: profile.degree || '',
            branch: profile.branch || '',
            current_semester: profile.current_semester || '',
            cgpa: profile.cgpa || '',
            academic_year: profile.academic_year || '',
            skills: parsedSkills,
            projects: profile.projects || [],
            certifications: profile.certifications || [],
            objective: profile.objective || '',
            tenth_board: profile.tenth_board || '',
            tenth_percent: profile.tenth_percent || '',
            tenth_year: profile.tenth_year || '',
            twelfth_board: profile.twelfth_board || '',
            twelfth_percent: profile.twelfth_percent || '',
            twelfth_year: profile.twelfth_year || ''
          });
        }
      } catch (err) {
        console.error('Error fetching profile', err);
      }
    };

    fetchProfile();
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSkillChange = (e) => {
    setFormData({
      ...formData,
      skills: {
        ...formData.skills,
        [e.target.name]: e.target.value
      }
    });
  };

  const handleAddProject = () => {
    setFormData({
      ...formData,
      projects: [...formData.projects, { title: '', technologies: '', description: '', link: '' }]
    });
  };

  const handleProjectChange = (index, field, value) => {
    const updatedProjects = [...formData.projects];
    updatedProjects[index][field] = value;
    setFormData({ ...formData, projects: updatedProjects });
  };

  const handleRemoveProject = (index) => {
    const updatedProjects = formData.projects.filter((_, i) => i !== index);
    setFormData({ ...formData, projects: updatedProjects });
  };

  const handleAddCert = () => {
    setFormData({
      ...formData,
      certifications: [...formData.certifications, { name: '', organization: '', date: '' }]
    });
  };

  const handleCertChange = (index, field, value) => {
    const updatedCerts = [...formData.certifications];
    updatedCerts[index][field] = value;
    setFormData({ ...formData, certifications: updatedCerts });
  };

  const handleRemoveCert = (index) => {
    const updatedCerts = formData.certifications.filter((_, i) => i !== index);
    setFormData({ ...formData, certifications: updatedCerts });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const res = await axios.put('http://localhost:5000/api/profiles/student', formData, {
        withCredentials: true
      });
      if (res.data.success) {
        setMessage('ATS Profile saved successfully!');
      }
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || err.message || 'Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    window.open('http://localhost:5000/api/profiles/student/resume', '_blank');
  };

  return (
    <div className="max-w-5xl mx-auto mt-6 pb-12">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">ATS Resume Builder</h1>
          <p className="text-gray-500 mt-1">Structure your data for optimal ATS parsing.</p>
        </div>
        <button
          onClick={handleDownload}
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg shadow-lg transition-colors font-medium flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          Download PDF
        </button>
      </div>

      {message && (
        <div className={`p-4 mb-6 rounded-lg font-medium ${message.includes('success') ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">

        {/* 1. Personal Information */}
        <section className="bg-white dark:bg-[#1f2028] p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-[#2e303a]">
          <h2 className="text-xl font-bold mb-6 border-b pb-2 text-[#aa3bff] border-gray-100 dark:border-gray-700">1. Personal Information (Header Section)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Full Name</label>
              <input type="text" value={user?.name || ''} disabled className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-800 dark:border-gray-600 cursor-not-allowed text-gray-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Professional Email</label>
              <input type="text" value={user?.email || ''} disabled className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-800 dark:border-gray-600 cursor-not-allowed text-gray-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Phone Number</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-3 border rounded-lg dark:bg-[#16171d] dark:border-gray-600 focus:ring-2 focus:ring-[#aa3bff] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Location (City, State)</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="e.g., Begusarai, Bihar" className="w-full p-3 border rounded-lg dark:bg-[#16171d] dark:border-gray-600 focus:ring-2 focus:ring-[#aa3bff] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">LinkedIn Profile URL</label>
              <input type="url" name="linkedin_link" value={formData.linkedin_link} onChange={handleChange} className="w-full p-3 border rounded-lg dark:bg-[#16171d] dark:border-gray-600 focus:ring-2 focus:ring-[#aa3bff] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">GitHub Repository URL</label>
              <input type="url" name="github_link" value={formData.github_link} onChange={handleChange} className="w-full p-3 border rounded-lg dark:bg-[#16171d] dark:border-gray-600 focus:ring-2 focus:ring-[#aa3bff] outline-none" />
            </div>
          </div>
        </section>
        {/* section for objective */}
        <section className="bg-white dark:bg-[#1f2028] p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-[#2e303a]">
          <h2 className="text-xl font-bold mb-6 border-b pb-2 text-[#aa3bff] border-gray-100 dark:border-gray-700">2. Career Objective (Header Section)</h2>
          <div className="mt-6">
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Career Objective</label>
            <textarea
              name="objective"
              value={formData.objective}
              onChange={handleChange}
              rows="3"
              placeholder="Write a brief, professional statement summarizing your core strengths and immediate career objectives..."
              className="w-full p-3 border rounded-lg dark:bg-[#16171d] dark:border-gray-600 focus:ring-2 focus:ring-[#aa3bff] outline-none resize-none"
            />
          </div>
        </section>

        {/* 2. Academic Profile */}
        <section className="bg-white dark:bg-[#1f2028] p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-[#2e303a]">
          <h2 className="text-xl font-bold mb-6 border-b pb-2 text-[#aa3bff] border-gray-100 dark:border-gray-700">3. Academic Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Degree/Course</label>
              <input type="text" name="degree" value={formData.degree} onChange={handleChange} placeholder="e.g., Bachelor of Computer Applications" className="w-full p-3 border rounded-lg dark:bg-[#16171d] dark:border-gray-600 focus:ring-2 focus:ring-[#aa3bff] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Branch/Specialization</label>
              <input type="text" name="branch" value={formData.branch} onChange={handleChange} placeholder="e.g., Computer Science" className="w-full p-3 border rounded-lg dark:bg-[#16171d] dark:border-gray-600 focus:ring-2 focus:ring-[#aa3bff] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Current Semester</label>
              <input type="text" name="current_semester" value={formData.current_semester} onChange={handleChange} placeholder="e.g., Semester 6" className="w-full p-3 border rounded-lg dark:bg-[#16171d] dark:border-gray-600 focus:ring-2 focus:ring-[#aa3bff] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Academic Year</label>
              <input type="text" name="academic_year" value={formData.academic_year} onChange={handleChange} placeholder="e.g., 2025-26" className="w-full p-3 border rounded-lg dark:bg-[#16171d] dark:border-gray-600 focus:ring-2 focus:ring-[#aa3bff] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">CGPA / Percentage</label>
              <input type="number" step="0.01" name="cgpa" value={formData.cgpa} onChange={handleChange} className="w-full p-3 border rounded-lg dark:bg-[#16171d] dark:border-gray-600 focus:ring-2 focus:ring-[#aa3bff] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Institution</label>
              <input type="text" value="Ganga Global Institute of Management Studies" disabled className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-800 dark:border-gray-600 cursor-not-allowed text-gray-500" />
            </div>
          </div>

          {/* Secondary / Higher Secondary Schooling Details */}
          <div className="mt-8 pt-6 border-t border-dashed border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold mb-4 text-gray-700 dark:text-gray-300">Secondary & Higher Secondary (Optional)</h3>
            
            {/* 12th standard */}
            <div className="bg-gray-50 dark:bg-[#16171d]/40 p-5 rounded-xl border border-gray-100 dark:border-gray-700 mb-6">
              <h4 className="font-bold text-sm text-slate-500 uppercase tracking-wider mb-3">Class XII (Higher Secondary)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1 text-gray-500 uppercase">Board/Authority</label>
                  <input type="text" name="twelfth_board" value={formData.twelfth_board} onChange={handleChange} placeholder="e.g., CBSE, BSEB" className="w-full p-3 border rounded-lg bg-white dark:bg-[#16171d] dark:border-gray-600 focus:ring-2 focus:ring-[#aa3bff] outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 text-gray-500 uppercase">Passing Year</label>
                  <input type="text" name="twelfth_year" value={formData.twelfth_year} onChange={handleChange} placeholder="e.g., 2023" className="w-full p-3 border rounded-lg bg-white dark:bg-[#16171d] dark:border-gray-600 focus:ring-2 focus:ring-[#aa3bff] outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 text-gray-500 uppercase">Score (% / CGPA)</label>
                  <input type="text" name="twelfth_percent" value={formData.twelfth_percent} onChange={handleChange} placeholder="e.g., 85% or 8.5" className="w-full p-3 border rounded-lg bg-white dark:bg-[#16171d] dark:border-gray-600 focus:ring-2 focus:ring-[#aa3bff] outline-none" />
                </div>
              </div>
            </div>

            {/* 10th standard */}
            <div className="bg-gray-50 dark:bg-[#16171d]/40 p-5 rounded-xl border border-gray-100 dark:border-gray-700">
              <h4 className="font-bold text-sm text-slate-500 uppercase tracking-wider mb-3">Class X (Secondary)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1 text-gray-500 uppercase">Board/Authority</label>
                  <input type="text" name="tenth_board" value={formData.tenth_board} onChange={handleChange} placeholder="e.g., CBSE, BSEB" className="w-full p-3 border rounded-lg bg-white dark:bg-[#16171d] dark:border-gray-600 focus:ring-2 focus:ring-[#aa3bff] outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 text-gray-500 uppercase">Passing Year</label>
                  <input type="text" name="tenth_year" value={formData.tenth_year} onChange={handleChange} placeholder="e.g., 2021" className="w-full p-3 border rounded-lg bg-white dark:bg-[#16171d] dark:border-gray-600 focus:ring-2 focus:ring-[#aa3bff] outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 text-gray-500 uppercase">Score (% / CGPA)</label>
                  <input type="text" name="tenth_percent" value={formData.tenth_percent} onChange={handleChange} placeholder="e.g., 90% or 9.0" className="w-full p-3 border rounded-lg bg-white dark:bg-[#16171d] dark:border-gray-600 focus:ring-2 focus:ring-[#aa3bff] outline-none" />
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 3. Technical Skills */}
        <section className="bg-white dark:bg-[#1f2028] p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-[#2e303a]">
          <h2 className="text-xl font-bold mb-6 border-b pb-2 text-[#aa3bff] border-gray-100 dark:border-gray-700">4. Technical Skills (Categorized for ATS)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Languages</label>
              <input type="text" name="languages" value={formData.skills.languages} onChange={handleSkillChange} placeholder="e.g., JavaScript, C, Java" className="w-full p-3 border rounded-lg dark:bg-[#16171d] dark:border-gray-600 focus:ring-2 focus:ring-[#aa3bff] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Frontend</label>
              <input type="text" name="frontend" value={formData.skills.frontend} onChange={handleSkillChange} placeholder="e.g., React 18, Tailwind CSS" className="w-full p-3 border rounded-lg dark:bg-[#16171d] dark:border-gray-600 focus:ring-2 focus:ring-[#aa3bff] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Backend & Databases</label>
              <input type="text" name="backend" value={formData.skills.backend} onChange={handleSkillChange} placeholder="e.g., Node.js, Express.js, MySQL 8" className="w-full p-3 border rounded-lg dark:bg-[#16171d] dark:border-gray-600 focus:ring-2 focus:ring-[#aa3bff] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Tools</label>
              <input type="text" name="tools" value={formData.skills.tools} onChange={handleSkillChange} placeholder="e.g., Git, Vite, Postman" className="w-full p-3 border rounded-lg dark:bg-[#16171d] dark:border-gray-600 focus:ring-2 focus:ring-[#aa3bff] outline-none" />
            </div>
          </div>
        </section>

        {/* 4. Professional Projects */}
        <section className="bg-white dark:bg-[#1f2028] p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-[#2e303a]">
          <div className="flex justify-between items-center mb-6 border-b pb-2 text-[#aa3bff] border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold">5. Professional Projects</h2>
            <button type="button" onClick={handleAddProject} className="text-sm bg-[#aa3bff] hover:bg-[#902bd9] text-white px-4 py-2 rounded-lg transition-colors font-medium">
              + Add Project
            </button>
          </div>

          <div className="space-y-6">
            {formData.projects.map((proj, index) => (
              <div key={index} className="bg-gray-50 dark:bg-[#16171d] p-6 rounded-xl border border-gray-200 dark:border-gray-700 relative">
                <button type="button" onClick={() => handleRemoveProject(index)} className="absolute top-4 right-4 text-red-500 hover:text-red-700 font-bold p-2">✕</button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-8">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Project Title</label>
                    <input type="text" value={proj.title} onChange={(e) => handleProjectChange(index, 'title', e.target.value)} placeholder="e.g., College Placement Preparation Portal" className="w-full p-3 border rounded-lg dark:bg-[#1f2028] dark:border-gray-600 focus:ring-2 focus:ring-[#aa3bff] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Project Link</label>
                    <input type="url" value={proj.link} onChange={(e) => handleProjectChange(index, 'link', e.target.value)} placeholder="GitHub or Live URL" className="w-full p-3 border rounded-lg dark:bg-[#1f2028] dark:border-gray-600 focus:ring-2 focus:ring-[#aa3bff] outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Technologies Used</label>
                    <input type="text" value={proj.technologies} onChange={(e) => handleProjectChange(index, 'technologies', e.target.value)} placeholder="e.g., React, Node.js, Express, MongoDB" className="w-full p-3 border rounded-lg dark:bg-[#1f2028] dark:border-gray-600 focus:ring-2 focus:ring-[#aa3bff] outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Role / Description (Bullet points recommended)</label>
                    <textarea value={proj.description} onChange={(e) => handleProjectChange(index, 'description', e.target.value)} placeholder="- Implemented JWT-based authentication..." className="w-full p-3 border rounded-lg dark:bg-[#1f2028] dark:border-gray-600 h-28 focus:ring-2 focus:ring-[#aa3bff] outline-none" />
                  </div>
                </div>
              </div>
            ))}
            {formData.projects.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No professional projects added yet.</p>}
          </div>
        </section>

        {/* 5. Training & Certifications */}
        <section className="bg-white dark:bg-[#1f2028] p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-[#2e303a]">
          <div className="flex justify-between items-center mb-6 border-b pb-2 text-[#aa3bff] border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold">6. Training & Certifications</h2>
            <button type="button" onClick={handleAddCert} className="text-sm bg-[#aa3bff] hover:bg-[#902bd9] text-white px-4 py-2 rounded-lg transition-colors font-medium">
              + Add Certification
            </button>
          </div>

          <div className="space-y-4">
            {formData.certifications.map((cert, index) => (
              <div key={index} className="bg-gray-50 dark:bg-[#16171d] p-6 rounded-xl border border-gray-200 dark:border-gray-700 relative">
                <button type="button" onClick={() => handleRemoveCert(index)} className="absolute top-4 right-4 text-red-500 hover:text-red-700 font-bold p-2">✕</button>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pr-8">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Certification Name</label>
                    <input type="text" value={cert.name} onChange={(e) => handleCertChange(index, 'name', e.target.value)} className="w-full p-3 border rounded-lg dark:bg-[#1f2028] dark:border-gray-600 focus:ring-2 focus:ring-[#aa3bff] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Issuing Organization</label>
                    <input type="text" value={cert.organization} onChange={(e) => handleCertChange(index, 'organization', e.target.value)} className="w-full p-3 border rounded-lg dark:bg-[#1f2028] dark:border-gray-600 focus:ring-2 focus:ring-[#aa3bff] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Completion Date</label>
                    <input type="text" value={cert.date} onChange={(e) => handleCertChange(index, 'date', e.target.value)} placeholder="e.g., Aug 2024" className="w-full p-3 border rounded-lg dark:bg-[#1f2028] dark:border-gray-600 focus:ring-2 focus:ring-[#aa3bff] outline-none" />
                  </div>
                </div>
              </div>
            ))}
            {formData.certifications.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No certifications added yet.</p>}
          </div>
        </section>

        {/* 6. Automated Metrics */}
        <section className="bg-blue-50 dark:bg-blue-900/10 p-8 rounded-2xl border border-blue-100 dark:border-blue-900/30">
          <h2 className="text-xl font-bold mb-4 text-blue-800 dark:text-blue-400">7. Mock Interview & Test Metrics</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            These metrics are highly valuable for ATS tracking and recruiters. They will be <strong>automatically fetched</strong> from your latest portal activities and appended to the final PDF.
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1 mt-4">
            <li><strong>Mock Interview Readiness Score:</strong> Calculated from your AI chat mock sessions.</li>
            <li><strong>Top Skills/Aptitude Scores:</strong> Pulled from your completed timed MCQ tests.</li>
          </ul>
        </section>

        <div className="flex justify-end pt-6 border-t dark:border-gray-800">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-[#aa3bff] hover:bg-[#902bd9] text-white font-bold py-4 px-10 rounded-xl shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 text-lg w-full md:w-auto"
          >
            {isLoading ? 'Saving...' : 'Save Profile Details'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default ResumeBuilder;

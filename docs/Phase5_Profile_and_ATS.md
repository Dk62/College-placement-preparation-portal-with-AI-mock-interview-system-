# College Placement Preparation Portal
## Developer Documentation Book
---

# Phase 5: Applicant Tracking Systems (ATS)
## Chapter 8: Profile & Resume Builder Pipelines

### 8.1 Overview and Purpose
The Applicant Tracking System (ATS) module is responsible for capturing, parsing, and storing a student's entire academic and professional life cycle. 
This phase documents two primary React components:
1. `Profile.jsx`: A read-only dashboard that visually tracks a student's CGPA, personal details, and skills.
2. `ResumeBuilder.jsx`: A massive 400+ line dynamic form that generates standardized JSON payloads, which are later compiled into ATS-friendly PDF documents by the backend.

---

### 8.2 Student Profile View (`Profile.jsx`)
The Profile component is a highly visual, responsive layout. It features a custom CSS progress bar to track CGPA metrics and dynamically renders technical skills as tag-chips.

#### 8.2.1 CGPA Visualization Logic
```jsx
{studentData.cgpa && (
  <div className="bg-gradient-to-br from-[#1e3a8a] to-blue-900 rounded-2xl p-6 shadow-lg text-white text-center">
    <p className="text-blue-200 text-sm font-bold uppercase tracking-wider">Current CGPA</p>
    <h2 className="text-5xl font-black mt-2">{studentData.cgpa}</h2>
    
    {/* Dynamic Mathematical Progress Bar */}
    <div className="mt-4 w-full bg-white/20 h-2 rounded-full overflow-hidden">
      <div 
        className="bg-green-400 h-full" 
        style={{width: `${(studentData.cgpa / 10) * 100}%`}}
      ></div>
    </div>
  </div>
)}
```
**Technical Note:** The inline styling `style={{width: ...}}` mathematically converts the standard 10-point CGPA system into a percentage, directly manipulating the DOM to fill the progress bar accurately without needing external chart libraries.

---

### 8.3 The ATS Data Configurator (`ResumeBuilder.jsx`)
The `ResumeBuilder.jsx` component is one of the largest state-managed forms in the application. It captures deeply nested JSON structures, specifically for `projects` and `certifications` arrays, allowing users to dynamically add or remove sections.

#### 8.3.1 Dynamic Array State Management
```jsx
  // Add an empty dictionary to the projects array
  const handleAddProject = () => {
    setFormData({
      ...formData,
      projects: [...formData.projects, { title: '', technologies: '', description: '', link: '' }]
    });
  };

  // Update a specific field within a specific dictionary inside the array
  const handleProjectChange = (index, field, value) => {
    const updatedProjects = [...formData.projects];
    updatedProjects[index][field] = value;
    setFormData({ ...formData, projects: updatedProjects });
  };

  // Splice/filter a dictionary out of the array
  const handleRemoveProject = (index) => {
    const updatedProjects = formData.projects.filter((_, i) => i !== index);
    setFormData({ ...formData, projects: updatedProjects });
  };
```

#### 8.3.2 ATS Output and PDF Trigger
The bottom of the `ResumeBuilder.jsx` component contains the trigger that commands the backend to compile this massive JSON payload into a physical PDF file.
```jsx
  const handleDownload = () => {
    // Calling this API forces the Express backend to run Puppeteer/PDFKit 
    // and returns a raw PDF Buffer stream directly to the browser tab.
    window.open('http://localhost:5000/api/profiles/student/resume', '_blank');
  };
```

### 8.4 Detailed Technical Breakdown

#### 8.4.1 Safely Parsing Legacy Database Data
When migrating databases or updating schema logic, legacy profiles might have stored their "Skills" as a basic string array instead of a categorized JSON object (e.g., separating frontend vs. backend). `ResumeBuilder.jsx` contains a defensive parsing algorithm in its `useEffect` to prevent React from crashing when older data is loaded:
```javascript
let parsedSkills = { languages: '', frontend: '', backend: '', tools: '' };

// Check if the skills column is already the modern JSON Dictionary
if (profile.skills && typeof profile.skills === 'object' && !Array.isArray(profile.skills)) {
  parsedSkills = { ...parsedSkills, ...profile.skills };
} 
// Fallback: If it's the legacy array, shove everything into the 'languages' field
else if (Array.isArray(profile.skills)) {
  parsedSkills.languages = profile.skills.join(', ');
}

setFormData({ ...formData, skills: parsedSkills });
```
This guarantees backwards compatibility across the entire database without needing a manual SQL migration script.

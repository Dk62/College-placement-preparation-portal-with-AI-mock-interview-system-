const PDFDocument = require('pdfkit');

const generateResume = (studentProfile, res) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  // Pipe the PDF into the response
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=resume_${studentProfile.enrollment_no || 'student'}.pdf`);
  doc.pipe(res);

  // 1. Personal Information (Header Section)
  doc.fontSize(22).font('Helvetica-Bold').text(studentProfile.User?.name || 'Student Name', { align: 'center' });
  doc.moveDown(0.2);

  const email = studentProfile.User?.email || '';
  const phone = studentProfile.phone || '';
  const location = studentProfile.location || '';
  const linkedin = studentProfile.linkedin_link || '';
  const github = studentProfile.github_link || '';

  let contactInfo = [];
  if (email) contactInfo.push(email);
  if (phone) contactInfo.push(phone);
  if (location) contactInfo.push(location);
  
  doc.fontSize(10).font('Helvetica').text(contactInfo.join(' | '), { align: 'center' });
  
  let linksInfo = [];
  if (linkedin) linksInfo.push(`LinkedIn: ${linkedin}`);
  if (github) linksInfo.push(`GitHub: ${github}`);
  
  if (linksInfo.length > 0) {
    doc.text(linksInfo.join(' | '), { align: 'center' });
  }
  doc.moveDown(1);

  // Career Objective Section
  if (studentProfile.objective) {
    doc.fontSize(14).font('Helvetica-Bold').text('OBJECTIVE');
    doc.moveTo(doc.x, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').text(studentProfile.objective, { align: 'justify' });
    doc.moveDown(1);
  }

  // Helper function for Section Headers
  const addSectionHeader = (title) => {
    doc.fontSize(14).font('Helvetica-Bold').text(title.toUpperCase());
    doc.moveTo(doc.x, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
    doc.moveDown(0.5);
  };

  // 2. Academic Profile
  addSectionHeader('Academic Profile');
  const degree = studentProfile.degree || 'Degree';
  const branch = studentProfile.branch || 'Branch';
  const institution = 'Ganga Global Institute of Management Studies';
  const cgpa = studentProfile.cgpa ? `CGPA: ${studentProfile.cgpa}` : '';
  const academicYear = studentProfile.academic_year ? `Year: ${studentProfile.academic_year}` : '';
  const semester = studentProfile.current_semester ? `Sem: ${studentProfile.current_semester}` : '';

  doc.fontSize(12).font('Helvetica-Bold').text(`${degree} in ${branch}`);
  doc.fontSize(10).font('Helvetica').text(institution);
  
  let academicDetails = [];
  if (cgpa) academicDetails.push(cgpa);
  if (academicYear) academicDetails.push(academicYear);
  if (semester) academicDetails.push(semester);
  
  if (academicDetails.length > 0) {
    doc.fontSize(10).font('Helvetica-Oblique').text(academicDetails.join(' | '));
  }
  doc.moveDown(0.5);

  // Optional Schooling
  const hasTwelfth = studentProfile.twelfth_percent || studentProfile.twelfth_board || studentProfile.twelfth_year;
  const hasTenth = studentProfile.tenth_percent || studentProfile.tenth_board || studentProfile.tenth_year;

  if (hasTwelfth) {
    doc.fontSize(10).font('Helvetica-Bold').text('Higher Secondary (12th): ', { continued: true })
       .font('Helvetica').text(`${studentProfile.twelfth_board || 'N/A'} | ${studentProfile.twelfth_year || 'N/A'} | Score: ${studentProfile.twelfth_percent || 'N/A'}`);
  }
  
  if (hasTenth) {
    doc.fontSize(10).font('Helvetica-Bold').text('Secondary School (10th): ', { continued: true })
       .font('Helvetica').text(`${studentProfile.tenth_board || 'N/A'} | ${studentProfile.tenth_year || 'N/A'} | Score: ${studentProfile.tenth_percent || 'N/A'}`);
  }

  doc.moveDown(1);

  // 3. Technical Skills (Categorized)
  if (studentProfile.skills) {
    addSectionHeader('Technical Skills');
    const skills = studentProfile.skills; // Expected to be an object
    doc.fontSize(10).font('Helvetica');
    
    if (skills.languages) doc.font('Helvetica-Bold').text('Languages: ', { continued: true }).font('Helvetica').text(skills.languages);
    if (skills.frontend) doc.font('Helvetica-Bold').text('Frontend: ', { continued: true }).font('Helvetica').text(skills.frontend);
    if (skills.backend) doc.font('Helvetica-Bold').text('Backend & Databases: ', { continued: true }).font('Helvetica').text(skills.backend);
    if (skills.tools) doc.font('Helvetica-Bold').text('Tools: ', { continued: true }).font('Helvetica').text(skills.tools);
    
    doc.moveDown(1);
  }

  // 4. Professional Projects
  if (studentProfile.projects && studentProfile.projects.length > 0) {
    addSectionHeader('Professional Projects');
    studentProfile.projects.forEach(proj => {
      doc.fontSize(12).font('Helvetica-Bold').text(proj.title || 'Project Title', { continued: proj.link ? true : false });
      if (proj.link) {
        doc.font('Helvetica').text(` - ${proj.link}`, { link: proj.link, underline: true });
      }
      if (proj.technologies) {
        doc.fontSize(10).font('Helvetica-Oblique').text(`Technologies Used: ${proj.technologies}`);
      }
      doc.fontSize(10).font('Helvetica').text(proj.description || '').moveDown(0.5);
    });
    doc.moveDown(0.5);
  }

  // 5. Training & Certifications
  if (studentProfile.certifications && studentProfile.certifications.length > 0) {
    addSectionHeader('Training & Certifications');
    studentProfile.certifications.forEach(cert => {
      doc.fontSize(11).font('Helvetica-Bold').text(cert.name || 'Certification');
      doc.fontSize(10).font('Helvetica').text(`${cert.organization || 'Org'} | ${cert.date || 'Date'}`).moveDown(0.5);
    });
    doc.moveDown(0.5);
  }

  // 6. Mock Interview & Test Metrics
  const mockSessions = studentProfile.MockSessions;
  const testResults = studentProfile.TestResults;

  if ((mockSessions && mockSessions.length > 0) || (testResults && testResults.length > 0)) {
    addSectionHeader('Performance Metrics');
    
    if (mockSessions && mockSessions.length > 0) {
      doc.fontSize(10).font('Helvetica-Bold').text('Mock Interview Readiness Score: ', { continued: true })
         .font('Helvetica').text(`${mockSessions[0].overall_score || 'N/A'}/100`);
    }

    if (testResults && testResults.length > 0) {
      doc.fontSize(10).font('Helvetica-Bold').text('Latest Aptitude Score: ', { continued: true })
         .font('Helvetica').text(`${testResults[0].score || 'N/A'}/100`);
    }
  }

  // Finalize PDF file
  doc.end();
};

module.exports = { generateResume };

const { 
  CompanyProfile, PlacementDrive, DriveApplication, 
  StudentProfile, User, Notification, sequelize 
} = require('../models');
const PDFDocument = require('pdfkit');

// --- PROFILE & STATS ---
exports.getProfile = async (req, res) => {
  try {
    const profile = await CompanyProfile.findOne({ where: { userId: req.user.id } });
    res.json({ success: true, data: profile });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.updateProfile = async (req, res) => {
  try {
    const { company_name, description, website } = req.body;
    let profile = await CompanyProfile.findOne({ where: { userId: req.user.id } });
    if(!profile) profile = await CompanyProfile.create({ userId: req.user.id, company_name });
    
    profile.company_name = company_name || profile.company_name;
    profile.description = description;
    profile.website = website;
    await profile.save();

    res.json({ success: true, message: 'Corporate profile saved.', data: profile });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// --- DRIVE MANAGEMENT ---
exports.getOwnDrives = async (req, res) => {
  try {
    const profile = await CompanyProfile.findOne({ where: { userId: req.user.id } });
    if (!profile) return res.status(404).json({ success: false, message: 'Profile missing' });

    const drives = await PlacementDrive.findAll({
      where: { companyId: profile.id },
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: drives });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.postDrive = async (req, res) => {
  try {
    const profile = await CompanyProfile.findOne({ where: { userId: req.user.id } });
    if (!profile?.is_verified) {
      return res.status(403).json({ success: false, message: 'UNAUTHORIZED: Profile requires TPO verification before launches.' });
    }

    const drive = await PlacementDrive.create({
      ...req.body,
      companyId: profile.id,
      status: 'Upcoming'
    });
    res.status(201).json({ success: true, data: drive });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};

// --- APPLICANT TRACKING (ATS) ---
exports.getDriveApplications = async (req, res) => {
  try {
    const { driveId } = req.params;
    const apps = await DriveApplication.findAll({
      where: { driveId },
      include: [{
        model: StudentProfile,
        include: [{ model: User, attributes: ['name', 'email'] }]
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: apps });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.updateAppStatus = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { status } = req.body; // 'Shortlisted', 'Selected', 'Rejected'
    
    const app = await DriveApplication.findByPk(id, {
      include: [
        { model: PlacementDrive, include: [CompanyProfile] },
        { model: StudentProfile, include: [User] }
      ],
      transaction: t
    });

    if (!app) throw new Error('Application node not found.');

    app.status = status;
    await app.save({ transaction: t });

    // Synchronous transactional notification
    await Notification.create({
      userId: app.StudentProfile.User.id,
      title: `Application Status Change: ${app.PlacementDrive.CompanyProfile.company_name}`,
      message: `Your candidature for the ${app.PlacementDrive.job_role} role has transitioned to: ${status}.`,
      type: 'Alert'
    }, { transaction: t });

    await t.commit();
    res.json({ success: true, message: `Candidature progressed to ${status}` });
  } catch (e) {
    await t.rollback();
    res.status(500).json({ success: false, message: e.message });
  }
};

// --- DOCUMENT SYNTHESIS (OFFER LETTER) ---
exports.generateOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const app = await DriveApplication.findByPk(id, {
      include: [
        { model: PlacementDrive, include: [CompanyProfile] },
        { model: StudentProfile, include: [User] }
      ]
    });

    if (!app || app.status !== 'Selected') {
      return res.status(400).send("Cannot generate offers unless candidate is formally 'Selected'.");
    }

    const doc = new PDFDocument({ margin: 50 });
    let filename = `Offer_${app.StudentProfile.User.name.replace(/\s+/g, '_')}.pdf`;

    res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
    res.setHeader('Content-type', 'application/pdf');

    doc.pipe(res);

    // Visual Design 
    doc.fillColor('#1e3a8a').fontSize(24).text('LETTER OF INTENT / OFFER', { align: 'center' });
    doc.moveDown();
    doc.fillColor('#000').fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' });
    doc.moveDown(2);

    doc.text(`To,`, { bold: true });
    doc.text(`${app.StudentProfile.User.name}`);
    doc.text(`${app.StudentProfile.branch} Department`);
    doc.moveDown(2);

    doc.text(`Dear ${app.StudentProfile.User.name.split(' ')[0]},`);
    doc.moveDown();
    doc.text(`Following your recent evaluation process, we are highly impressed with your credentials. On behalf of ${app.PlacementDrive.CompanyProfile.company_name}, it is our pleasure to formally extend an offer of employment for the position of ${app.PlacementDrive.job_role}.`);
    
    doc.moveDown();
    doc.text(`Proposed CTC: ${app.PlacementDrive.package_lpa} LPA`);
    doc.moveDown();
    doc.text(`This offer remains subject to the consistent maintenance of academic benchmarks pre-onboarding.`);
    
    doc.moveDown(4);
    doc.text(`Sincerely,`, { align: 'left' });
    doc.moveDown();
    doc.text(`The HR Department,`);
    doc.fontSize(14).fillColor('#1e3a8a').text(`${app.PlacementDrive.CompanyProfile.company_name}`);

    doc.end();
  } catch (e) { res.status(500).send("PDF Synthesis failure: " + e.message); }
};

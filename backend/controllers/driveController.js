const { PlacementDrive, DriveApplication, CompanyProfile, StudentProfile, User } = require('../models');
const sendEmail = require('../utils/emailService');

// @desc    Get all placement drives
// @route   GET /api/drives
// @access  Private
exports.getDrives = async (req, res) => {
  try {
    const drives = await PlacementDrive.findAll({
      include: [{ model: CompanyProfile, attributes: ['company_name'] }]
    });
    res.status(200).json({ success: true, data: drives });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create a new placement drive
// @route   POST /api/drives
// @access  Private (Company or TPO only)
exports.createDrive = async (req, res) => {
  try {
    let companyId;

    if (req.user.role === 'Company') {
      const company = await CompanyProfile.findOne({ where: { userId: req.user.id } });
      companyId = company.id;
    } else {
      // If TPO, require companyId in body
      companyId = req.body.companyId;
    }

    const drive = await PlacementDrive.create({
      ...req.body,
      companyId
    });

    res.status(201).json({ success: true, data: drive });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Apply to a drive
// @route   POST /api/drives/:id/apply
// @access  Private (Student only)
exports.applyForDrive = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ where: { userId: req.user.id } });
    const drive = await PlacementDrive.findByPk(req.params.id);

    if (!drive) {
      return res.status(404).json({ success: false, message: 'Drive not found' });
    }

    // Check eligibility logic (simplified)
    if (student.cgpa < drive.eligibility_cgpa) {
      return res.status(400).json({ success: false, message: 'Not eligible based on CGPA' });
    }

    const application = await DriveApplication.create({
      studentId: student.id,
      driveId: drive.id,
      status: 'Applied'
    });

    res.status(201).json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update application status
// @route   PUT /api/drives/applications/:id
// @access  Private (Company or TPO only)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const application = await DriveApplication.findByPk(req.params.id, {
      include: [{ model: StudentProfile, include: [User] }, { model: PlacementDrive, include: [CompanyProfile] }]
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    application.status = status;
    await application.save();

    // Send Email Notification if Shortlisted or Selected
    if (status === 'Shortlisted' || status === 'Selected') {
      const studentEmail = application.StudentProfile.User.email;
      const companyName = application.PlacementDrive.CompanyProfile.company_name;

      try {
        await sendEmail({
          email: studentEmail,
          subject: `Update on your application at ${companyName}`,
          message: `Congratulations! Your application status has been updated to: ${status} for the role of ${application.PlacementDrive.job_role}.`
        });
      } catch (err) {
        console.error('Email could not be sent', err);
      }
    }

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

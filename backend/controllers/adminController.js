const { User, QuestionBank, PlacementDrive, CompanyProfile, StudentProfile, AuditLog, sequelize } = require('../models');
const { Op } = require('sequelize');

const logAction = async (adminId, action, entity, info) => {
  try {
    await AuditLog.create({
      admin_id: adminId,
      action_type: action,
      target_entity: entity,
      details: info
    });
  } catch (e) {
    console.error('Failed log audit action', e);
  }
};

// --- ANALYTICS & STATS ---
exports.getAdminStats = async (req, res) => {
  try {
    const counts = await Promise.all([
      User.count({ where: { role: 'Student' } }),
      CompanyProfile.count(),
      PlacementDrive.count(),
      AuditLog.count()
    ]);

    res.json({
      success: true,
      data: {
        totalStudents: counts[0],
        registeredCompanies: counts[1],
        activeDrives: counts[2],
        systemLogs: counts[3]
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- USER CONTROL ---
exports.getAllUsers = async (req, res) => {
  try {
    const { search, role } = req.query;
    let whereCondition = {};

    if (search) {
      whereCondition = {
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } }
        ]
      };
    }
    if (role) whereCondition.role = role;

    const users = await User.findAll({
      where: whereCondition,
      attributes: ['id', 'name', 'email', 'role', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await logAction(req.user.id, 'DELETE', 'User', `Removed user ${user.email} (ID: ${user.id})`);
    await user.destroy();

    res.json({ success: true, message: 'User successfully removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- QUESTION BANK CRUD ---
exports.getQuestionBank = async (req, res) => {
  try {
    const { domain } = req.query;
    const condition = domain ? { domain } : {};
    
    const questions = await QuestionBank.findAll({
      where: condition,
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: questions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addQuestion = async (req, res) => {
  try {
    const q = await QuestionBank.create(req.body);
    await logAction(req.user.id, 'CREATE', 'QuestionBank', `Added MCQ for domain ${q.domain}`);
    res.status(201).json({ success: true, data: q });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const q = await QuestionBank.findByPk(req.params.id);
    if(!q) return res.status(404).json({ success: false, message: 'Item not found' });

    await q.destroy();
    await logAction(req.user.id, 'DELETE', 'QuestionBank', `Deleted question ID ${req.params.id}`);
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- AUDIT LOGS ---
exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.findAll({
      include: [{ model: User, as: 'AdminUser', attributes: ['name', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit: 100
    });
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

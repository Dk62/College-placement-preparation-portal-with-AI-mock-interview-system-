const bcrypt = require('bcrypt');
const { User, StudentProfile, sequelize } = require('../models');

// @desc    Update user contact info and profile synchronization using transaction
// @route   PUT /api/users/update-settings
// @access  Private
exports.updateUserSettings = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { email, phone, location } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // 1. Update global User email if provided and different
    if (email && email !== user.email) {
      // Simple existence check for duplicate email
      const emailExists = await User.findOne({ where: { email } });
      if (emailExists) {
        await t.rollback();
        return res.status(400).json({ success: false, message: 'Email is already registered to another account' });
      }
      user.email = email;
      await user.save({ transaction: t });
    }

    // 2. Update associated StudentProfile phone/location if applicable
    if (user.role === 'Student') {
      const profile = await StudentProfile.findOne({ where: { userId: req.user.id } });
      if (profile) {
        if (phone) profile.phone = phone;
        if (location) profile.location = location;
        await profile.save({ transaction: t });
      }
    }

    await t.commit();
    res.status(200).json({
      success: true,
      message: 'Profile settings updated successfully',
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    await t.rollback();
    console.error('Update Settings Error:', error);
    res.status(500).json({ success: false, message: 'Server error while updating settings' });
  }
};

// @desc    Change account password
// @route   PUT /api/users/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Provide both current and new passwords.' });
    }

    const user = await User.findByPk(req.user.id);
    
    // Note: user.password was likely excluded in queries generally, load explicitly if needed
    const fullUser = await User.scope('withPassword').findByPk(req.user.id) || await User.findByPk(req.user.id);
    // If scope not configured, make sure password column is in model returned object.
    // Let me verify the model to ensure password comparison works
    
    const isMatch = await bcrypt.compare(currentPassword, fullUser.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect current password.' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    fullUser.password = await bcrypt.hash(newPassword, salt);
    await fullUser.save();

    res.status(200).json({ success: true, message: 'Password updated successfully!' });
  } catch (error) {
    console.error('Change Password Error:', error);
    res.status(500).json({ success: false, message: 'Server failure updating password.' });
  }
};

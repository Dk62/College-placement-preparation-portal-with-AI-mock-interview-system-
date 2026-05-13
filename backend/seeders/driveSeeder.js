const { User, CompanyProfile, PlacementDrive, sequelize } = require('../models');

const seedDrives = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    // Create a dummy company user
    let [companyUser] = await User.findOrCreate({
      where: { email: 'hr@techcorp.com' },
      defaults: {
        name: 'TechCorp HR',
        password: 'password123', // Doesn't matter, won't log in
        role: 'Company',
        is_verified: true
      }
    });

    // Create company profile
    let [companyProfile] = await CompanyProfile.findOrCreate({
      where: { userId: companyUser.id },
      defaults: {
        company_name: 'TechCorp Global',
        website: 'https://techcorp.com',
        description: 'A leading tech company.'
      }
    });

    // Create another company
    let [companyUser2] = await User.findOrCreate({
      where: { email: 'careers@innovatetech.io' },
      defaults: {
        name: 'InnovateTech HR',
        password: 'password123',
        role: 'Company',
        is_verified: true
      }
    });

    let [companyProfile2] = await CompanyProfile.findOrCreate({
      where: { userId: companyUser2.id },
      defaults: {
        company_name: 'InnovateTech',
        website: 'https://innovatetech.io',
        description: 'Revolutionizing finance.'
      }
    });

    // Seed Drives
    await PlacementDrive.findOrCreate({
      where: { job_role: 'Frontend Software Engineer' },
      defaults: {
        companyId: companyProfile.id,
        description: 'Looking for a React developer with 0-1 years of experience.',
        eligibility_cgpa: 7.0,
        eligibility_branch: 'CSE, IT, BCA, MCA',
        drive_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
      }
    });

    await PlacementDrive.findOrCreate({
      where: { job_role: 'Backend Node.js Developer' },
      defaults: {
        companyId: companyProfile.id,
        description: 'Strong knowledge of Express, Sequelize, and MySQL required.',
        eligibility_cgpa: 7.5,
        eligibility_branch: 'CSE, IT',
        drive_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      }
    });

    await PlacementDrive.findOrCreate({
      where: { job_role: 'Data Analyst Intern' },
      defaults: {
        companyId: companyProfile2.id,
        description: 'Python and SQL skills needed. 6 months internship leading to PPO.',
        eligibility_cgpa: 6.5,
        eligibility_branch: 'Any Branch',
        drive_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
      }
    });

    console.log('Successfully seeded companies and placement drives!');
  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    process.exit();
  }
};

seedDrives();

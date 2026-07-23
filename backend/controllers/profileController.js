'use strict';

/**
 * GET /api/profile
 * Returns public profile information.
 */
async function getProfile(req, res, next) {
  try {
    const profile = {
      name: 'Olasubomi',
      title: 'Full-Stack Developer & WhatsApp Bot Specialist',
      tagline: 'Building intelligent bots, automating the future, and deploying scalable cloud systems.',
      location: 'Nigeria',
      available: true,
      email: 'vegasola8@gmail.com',
      whatsapp: '+2349061198658',
      github: 'https://github.com/olasubomi-png',
      linkedin: null, // Coming soon
      stats: {
        commandsBuilt: 400,
        yearsLearning: 3,
        botUptime: '24/7',
      },
      skills: [
        { name: 'JavaScript', level: 92 },
        { name: 'Node.js', level: 88 },
        { name: 'WhatsApp Bot Development', level: 95 },
        { name: 'MongoDB', level: 80 },
        { name: 'AWS EC2', level: 78 },
        { name: 'Linux', level: 82 },
        { name: 'REST APIs', level: 85 },
        { name: 'AI Integration', level: 83 },
      ],
      techPills: [
        'Express.js', 'Baileys', 'Nginx', 'PM2', 'Git',
        'OpenAI API', 'SSH', 'Systemd', 'JSON', 'Async/Await',
        'Webhooks', 'FFmpeg',
      ],
    };

    return res.status(200).json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
}

module.exports = { getProfile };

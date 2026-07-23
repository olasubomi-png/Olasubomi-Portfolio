'use strict';

/**
 * GET /api/services
 * Returns the list of services offered.
 */
async function getServices(req, res, next) {
  try {
    const services = [
      {
        id: 1,
        icon: '💬',
        title: 'WhatsApp Bot Development',
        description:
          'Custom multi-device WhatsApp bots with 400+ commands — group management, AI tools, media downloaders, autoreplies, games, and more. Built on the battle-tested Baileys framework.',
        features: ['400+ commands', 'Multi-device support', 'AI integration', 'Group management'],
        price: 'Starting from $50',
      },
      {
        id: 2,
        icon: '🤖',
        title: 'AI Automation & Integration',
        description:
          'Integrate OpenAI, Gemini, and other AI APIs into bots and web apps. Build intelligent chatbots, content generators, and fully automated business workflows.',
        features: ['OpenAI / Gemini integration', 'Chatbot design', 'Workflow automation', 'API orchestration'],
        price: 'Starting from $80',
      },
      {
        id: 3,
        icon: '⚡',
        title: 'Backend API Development',
        description:
          'Scalable REST APIs built with Node.js and Express. Clean architecture, proper error handling, JWT auth, rate limiting, and comprehensive documentation.',
        features: ['RESTful design', 'JWT authentication', 'MongoDB integration', 'API documentation'],
        price: 'Starting from $100',
      },
      {
        id: 4,
        icon: '☁️',
        title: 'Cloud Deployment (AWS)',
        description:
          'Full AWS EC2 setup — Linux configuration, Nginx reverse proxy, SSL/HTTPS, PM2 process management, automated startup, and ongoing monitoring.',
        features: ['AWS EC2 setup', 'Nginx + SSL', 'PM2 management', '24/7 uptime'],
        price: 'Starting from $60',
      },
      {
        id: 5,
        icon: '📊',
        title: 'Bot Deployment Dashboard',
        description:
          'A custom web dashboard to manage multiple WhatsApp bot instances — track status, restart bots, view logs, and manage user sessions from one place.',
        features: ['Multi-bot management', 'Real-time monitoring', 'User auth system', 'Log viewer'],
        price: 'Starting from $120',
      },
      {
        id: 6,
        icon: '🎓',
        title: 'Consultation & Mentorship',
        description:
          'One-on-one sessions covering Node.js, bot development, cloud architecture, or code reviews. Ideal for developers who want to level up quickly.',
        features: ['Code review', 'Architecture guidance', 'Bot development tutoring', 'Cloud setup guide'],
        price: 'Starting from $30/hr',
      },
    ];

    return res.status(200).json({ success: true, count: services.length, data: services });
  } catch (err) {
    next(err);
  }
}

module.exports = { getServices };

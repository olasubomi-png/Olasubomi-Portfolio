'use strict';

/**
 * GET /api/projects
 * Returns the portfolio projects list.
 * Ready to swap the static array for a MongoDB query.
 */
async function getProjects(req, res, next) {
  try {
    const projects = [
      {
        id: 1,
        title: 'OLASUBOMI-MD Bot',
        type: 'WhatsApp MD Bot',
        icon: '🤖',
        description:
          'A powerful WhatsApp Multi Device bot built with Node.js and the Baileys framework. Features automation, AI tools, group management, media downloader, and 400+ commands — all running 24/7 on AWS EC2.',
        stack: ['Node.js', 'Baileys', 'MongoDB', 'AWS', 'PM2'],
        github: 'https://github.com/olasubomi-png',
        demo: 'https://wa.me/2349061198658',
        featured: true,
      },
      {
        id: 2,
        title: 'Bot Deployment Dashboard',
        type: 'Cloud Dashboard',
        icon: '📊',
        description:
          'A cloud dashboard for managing WhatsApp bot deployments — multiple accounts, authentication, automated startup systems, and real-time monitoring of bots running on AWS infrastructure.',
        stack: ['Express.js', 'MongoDB', 'Nginx', 'AWS EC2'],
        github: 'https://github.com/olasubomi-png',
        demo: null,
        featured: false,
      },
      {
        id: 3,
        title: 'AI Automation Platform',
        type: 'AI Tools',
        icon: '🧠',
        description:
          'AI-powered tools and automation workflows integrating OpenAI, Gemini, and other AI APIs into practical systems — from intelligent chatbots to content generation and data processing pipelines.',
        stack: ['OpenAI', 'Node.js', 'APIs', 'Webhooks'],
        github: 'https://github.com/olasubomi-png',
        demo: null,
        featured: false,
      },
      {
        id: 4,
        title: 'Developer Portfolio',
        type: 'Full-Stack Portfolio',
        icon: '🌐',
        description:
          'This very site — a production-ready portfolio with a Node.js/Express REST API backend, Helmet security, rate limiting, CORS, and a glassmorphism frontend with particle animations.',
        stack: ['HTML5', 'CSS3', 'JavaScript', 'Node.js', 'Express'],
        github: 'https://github.com/olasubomi-png',
        demo: null,
        featured: false,
      },
    ];

    return res.status(200).json({ success: true, count: projects.length, data: projects });
  } catch (err) {
    next(err);
  }
}

module.exports = { getProjects };

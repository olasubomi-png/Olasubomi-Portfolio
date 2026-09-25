'use strict';

/**
 * GET /api/profile
 * Returns profile / about data.
 */
async function getProfile(req, res, next) {
  try {
    const profile = {
      name: 'Ola Subomi',
      role: 'Full-Stack Developer & Software Engineer',
      tagline: 'I design and build production-ready web applications, SaaS platforms, AI-powered products, and digital systems.',
      bio: "I'm Ola Subomi, a full-stack developer and software engineer focused on building useful software from the ground up. I work across UI, frontend architecture, APIs, databases, authentication, payments, AI, integrations, deployment and infrastructure.",
      email: 'vegasola8@gmail.com',
      github: 'https://github.com/olasubomi-png',
      skills: [
        { name: 'Next.js / React', level: null },
        { name: 'TypeScript', level: null },
        { name: 'Node.js', level: null },
        { name: 'PostgreSQL / Drizzle', level: null },
        { name: 'Express / REST APIs', level: null },
        { name: 'AWS / Vercel / Nginx / PM2', level: null },
        { name: 'AI integrations', level: null },
        { name: 'Paystack / payments', level: null },
      ],
      techPills: [
        'Next.js', 'React', 'TypeScript', 'Node.js', 'Express',
        'PostgreSQL', 'Drizzle ORM', 'Vercel', 'AWS', 'Nginx', 'PM2',
        'Paystack', 'Baileys', 'AI APIs', 'tRPC',
      ],
    };

    return res.status(200).json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
}

module.exports = { getProfile };

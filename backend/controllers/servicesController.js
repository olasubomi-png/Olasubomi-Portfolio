'use strict';

/**
 * GET /api/services
 * Returns capabilities / what I build.
 */
async function getServices(req, res, next) {
  try {
    const services = [
      {
        id: 1,
        title: 'SaaS Platforms',
        description: 'Multi-tenant products with authentication, dashboards, databases, billing and production infrastructure.',
        icon: null,
      },
      {
        id: 2,
        title: 'AI-Powered Applications',
        description: 'AI features, assistants, generation workflows and intelligent automation.',
        icon: null,
      },
      {
        id: 3,
        title: 'Commerce Systems',
        description: 'Storefronts, products, inventory, payments and order management.',
        icon: null,
      },
      {
        id: 4,
        title: 'Communication Platforms',
        description: 'Customer-agent messaging, web chat, WhatsApp and external integrations.',
        icon: null,
      },
      {
        id: 5,
        title: 'APIs & Backend Systems',
        description: 'REST APIs, webhooks, authentication, database architecture and integrations.',
        icon: null,
      },
      {
        id: 6,
        title: 'Deployment & Infrastructure',
        description: 'Linux servers, AWS, Vercel, Nginx, PM2, environment configuration and production deployment.',
        icon: null,
      },
    ];

    return res.status(200).json({ success: true, count: services.length, data: services });
  } catch (err) {
    next(err);
  }
}

module.exports = { getServices };

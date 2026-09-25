'use strict';

/**
 * GET /api/projects
 * Returns the portfolio projects list.
 */
async function getProjects(req, res, next) {
  try {
    const projects = [
      {
        id: 1,
        title: 'CONVORA',
        type: 'Customer communication & agent platform',
        description:
          'Multi-tenant communication platform for organizations and agents — identity, tenancy, memberships, organization isolation, and foundations for customer conversations, web chat, WhatsApp and Meta integrations with AI assistance.',
        stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Drizzle', 'AI', 'Meta APIs'],
        github: 'https://github.com/olasubomi-png/CONVORA',
        demo: null,
        featured: true,
      },
      {
        id: 2,
        title: 'SUBBY-STORE',
        type: 'Multi-tenant e-commerce platform',
        description:
          'Mobile-first ecommerce for small businesses — storefronts, products, inventory, orders, Paystack payments, seller wallets, image uploads and dashboard.',
        stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Drizzle', 'Paystack', 'Vercel Blob'],
        github: 'https://github.com/olasubomi-png/SUBBY-STORE',
        demo: null,
        featured: false,
      },
      {
        id: 3,
        title: 'SUBBY-VIRTUAL',
        type: 'Virtual numbers & temporary communication',
        description:
          'Communications testing workspace for mock SMS activations, temporary mail inboxes, wallet ledger and user dashboard — built for compliant provider integration.',
        stack: ['React', 'Vite', 'Express', 'tRPC', 'Drizzle', 'PostgreSQL'],
        github: 'https://github.com/olasubomi-png/SUBBY-VIRTUAL',
        demo: null,
        featured: false,
      },
      {
        id: 4,
        title: 'SUBBY-AI',
        type: 'AI-powered developer platform',
        description:
          'Full-stack AI platform with React client, Express/tRPC server, Drizzle ORM, and integrations for intelligent workflows and developer tooling.',
        stack: ['React', 'TypeScript', 'tRPC', 'Drizzle', 'Express', 'AI APIs'],
        github: 'https://github.com/olasubomi-png/SUBBY-AI',
        demo: null,
        featured: false,
      },
      {
        id: 5,
        title: 'SUBFLIX',
        type: 'Streaming platform',
        description:
          'Modern streaming platform with session auth, database-backed movie and series catalog, genres, search, and admin import — built on Next.js and PostgreSQL.',
        stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Drizzle', 'Tailwind'],
        github: 'https://github.com/olasubomi-png/SUBFLIX',
        demo: null,
        featured: false,
      },
      {
        id: 6,
        title: 'MOTOR',
        type: 'Automotive marketplace',
        description:
          'Premium automotive dealership platform — vehicle listings, inventory search and filter, detail galleries, availability states and responsive catalog.',
        stack: ['Next.js', 'TypeScript', 'Tailwind'],
        github: 'https://github.com/olasubomi-png/MOTO',
        demo: null,
        featured: false,
      },
      {
        id: 7,
        title: 'VEGAS-MD',
        type: 'WhatsApp automation platform',
        description:
          'Node.js WhatsApp multi-device automation with Baileys — command architecture, AI integration, media tools, group management and production deployment with PM2.',
        stack: ['Node.js', 'Baileys', 'JavaScript', 'PM2', 'AI APIs'],
        github: 'https://github.com/olasubomi-png/Vegas-MD',
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

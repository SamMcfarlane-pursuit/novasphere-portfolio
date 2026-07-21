# McFarlane IDE Consulting

Interactive 3D portfolio website featuring a dynamic globe visualization, Three.js animations, and an amber/gold design theme. Built as a showcase of modern React development techniques.

## Featured Projects Showcased

The portfolio dynamically renders data for several end-to-end production AI applications architected by Samuel, including:
- **LeadFlow CRM** — AI-powered lead management with Kanban pipeline and automated Google Sheets sync.
- **Crypto Pulse AI** — AI-powered cryptocurrency market intelligence with real-time analytics.
- **Auction Intel** — Rust-backed property investment platform for US tax lien analytics.
- **HVAC Hub** — Full-stack industry OS with AI-powered job triage.

## Tech Stack

- **React** + **Vite** — Fast, modern frontend tooling
- **Three.js** / **React Three Fiber** — 3D globe and particle effects
- **Framer Motion** — Smooth page transitions and animations
- **TailwindCSS** — Utility-first styling
- **Netlify** — Production deployment

## Getting Started

```bash
# Clone the repository
git clone https://github.com/SamMcfarlane-pursuit/mcfarlane-ide-consulting.git

# Navigate to the project directory
cd mcfarlane-ide-consulting

# Install dependencies
npm install

# Run the development server
npm run dev
```

## Deployment

This project is configured for [Netlify](https://www.netlify.com) via `netlify.toml`:

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- Client-side routing (React Router) is handled with a catch-all redirect to `index.html`.

To connect this repository, create a new site in the Netlify dashboard from this Git repo — the build settings are picked up automatically from `netlify.toml`. Push to `main` to trigger an automatic production deployment.

## License

© 2026 McFarlane IDE Consulting. All rights reserved.

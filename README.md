# Agent Fabric - A connected story

A customer-friendly, interactive guide to MuleSoft Agent Fabric, with animated request flows, component explanations, and three example stories.

**Website:** https://git-pandia.github.io/agent-fabric-guide/

## Use locally

Open `index.html` in a modern browser. Keep `index.html`, `styles.css`, and `app.js` together. No installation, API key, account, or server is required. The site works offline; optional documentation links require an internet connection.

## Features

- Animated request and result handoffs, active components, and policy checkpoints.
- Three authored stories: resolve a delayed order, onboard an employee, and safely deny a sensitive-data operation.
- Play/pause, previous/next step, restart, playback speed, and a step slider.
- Simple and Technical modes, illustrative payloads, and a simulated request log.
- Searchable component guides, customer FAQs, and official documentation links.
- Responsive layouts, presentation mode, keyboard controls, and reduced-motion support.

## Edit

- `index.html`: page structure, icons, and network layout.
- `styles.css`: colors, typography, and responsive styling.
- `app.js`: scenarios, component content, and interactions.
- `build.py`: optional standalone HTML builder.
- `.github/workflows/pages.yml`: builds and deploys the site to GitHub Pages after pushes to `main`.

To generate a portable single-file copy:

```sh
python3 build.py
```

This creates `dist/agent-fabric-guide.html`. Python is needed only for the optional build, not for running the website.

## Publishing

GitHub Pages must be enabled for this repository with **GitHub Actions** as the publishing source. The workflow publishes only the built website from `_site`, not the full source directory. Check the repository's Actions tab for deployment status.

## Scope

This is an independent educational simulation, not an official MuleSoft product UI or a live MuleSoft connection. All example requests, identities, payloads, policies, and outcomes are fictional. The diagram is a logical teaching model rather than a literal deployment topology. Registry and visualization are management capabilities, not serial request hops. Actual deployment and policy coverage depend on configuration. Verify current official documentation before making production architecture decisions.

MuleSoft, Salesforce, and related names are trademarks of their respective owners. Do not put credentials or customer data in this front-end project.

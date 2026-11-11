# Agent Fabric - A connected story

A customer-friendly, interactive guide to MuleSoft Agent Fabric, with animated request flows, component explanations, and four example stories.

**Website:** https://git-pandia.github.io/agent-fabric-guide/

**Weather story:** https://git-pandia.github.io/agent-fabric-guide/?story=weather

## Use locally

Open `index.html` in a modern browser. Keep `index.html`, `styles.css`, `app.js`, `weather.css`, and `weather.js` together. No installation, API key, account, or server is required. The guide works offline; optional documentation links require an internet connection.

## Features

- Animated request/result handoffs, active components, and policy checkpoints.
- Four authored stories: delayed order, employee onboarding, sensitive-data denial, and a city-weather question.
- Play/pause, previous/next, restart, playback speed, and a step slider.
- Simple/Technical explanations, illustrative payloads, and an authored request log.
- Searchable component guides, customer FAQs, official documentation, presentation mode, keyboard controls, responsive layouts, and reduced-motion support.

## Weather example and POC comparison

Choose **Ask a weather agent**, enter a city, select Celsius or Fahrenheit, and press **Ask & follow**. The ten-stage reference path is:

1. Receive the city-weather question.
2. Apply illustrative ingress checks.
3. Interpret the question and choose the configured route.
4. Delegate from the broker to a weather specialist over A2A.
5. Invoke a weather tool over MCP.
6. Fetch the observation from the backing weather API over HTTPS.
7. Return the MCP result to the agent and the A2A result to the broker.
8. Compose an answer grounded in the returned result.
9. Deliver the answer to the user.
10. Compare the journey with actual network evidence.

The example uses one specialist and one read-only tool. It does not call a second agent or create a ticket. **All readings are fictional fixtures, not current weather.** Any accepted city labels a fixture; there is no real place-name lookup. No provider, agent network, or POC is contacted. Payloads are teaching objects, not protocol schemas.

**Match my POC** changes the displayed broker, agent, MCP server, tool, and provider names for this page session. It also provides a comparison checklist and simulated outcomes: weather returned, location not found, or provider unavailable. Failure outcomes contain no invented observation. Labels are not persisted or transmitted; never enter credentials or private data.

Changing labels does not change topology. This reference assumes a separate A2A specialist and an MCP-backed weather provider. A broker calling MCP directly, or an agent calling an API without MCP, has a different path. Verify your actual configuration and runtime evidence before presenting an exact architecture match. The two illustrated LLM calls and gateway checkpoints are not claims about your implementation.

A city/units can be preselected using `?story=weather&city=Mumbai&units=fahrenheit`. The story remains a simulation.

## Edit and build

- `index.html`: page structure and network layout.
- `styles.css`: shared styling.
- `app.js`: original stories, component library, and playback engine.
- `weather.js`: isolated weather scenario, contextual explanations, and POC mapping.
- `weather.css`: weather controls and single-specialist layout.
- `build.py`: bundles all four CSS/JS assets into one standalone HTML file.
- `tests/test_weather.py`: browser checks for all four stories and the weather-specific controls.
- `.github/workflows/pages.yml`: builds and deploys pushes to `main`.

```sh
python3 build.py
```

This creates `dist/agent-fabric-guide.html`. Python is needed only for building, not for opening the website.

To run the browser checks, install Python Playwright and a compatible Chromium browser, then run:

```sh
python3 tests/test_weather.py
```

Set `CHROMIUM_EXECUTABLE` when using a system browser outside the usual path.

## Publishing

GitHub Pages uses **GitHub Actions** as the publishing source. The workflow publishes only the built website from `_site`, not the source directory. Check the Actions tab for deployment status.

## Scope

This is an independent educational simulation, not an official MuleSoft product UI or a live MuleSoft connection. Requests, identities, payloads, policies, weather observations, and outcomes are fictional. The diagram is a logical teaching model. Registry and visualization are management capabilities, not serial request hops. Actual deployment and policy coverage depend on configuration. Verify current official documentation before making production architecture decisions.

MuleSoft, Salesforce, and related names are trademarks of their respective owners. Do not put credentials or customer data in this front-end project.

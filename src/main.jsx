import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'instantsearch.css/themes/satellite-min.css';
import './index.css';

const root = createRoot(document.getElementById('root'));

/**
 * `App` is imported dynamically so a configuration failure is *visible*.
 *
 * `searchClient.js` and `searchParams.js` both throw at module scope by design — a
 * missing `VITE_ALGOLIA_*` variable, or a write key that has been given the `VITE_`
 * prefix, must stop the app rather than let it run half-configured. With a static import
 * that throw happens before React mounts and the reviewer gets a blank page and a console
 * trace, which is exactly the failure §7 warns about: "environment variables, build config
 * and asset paths fail in ways local development hides."
 *
 * A static import cannot be caught. A dynamic one can, so the message reaches the screen.
 */
import('./App.jsx')
  .then(({ default: App }) => {
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  })
  .catch((error) => {
    root.render(
      <div className="boot-error" role="alert">
        <h1>This build is not configured</h1>
        <pre>{error?.message ?? String(error)}</pre>
        <p>
          Set the <code>VITE_ALGOLIA_*</code> variables in <code>.env</code> for local development, and in the
          deployment platform&apos;s environment settings for a build — Vercel reads them from Project Settings,
          not from the repository.
        </p>
      </div>
    );
  });

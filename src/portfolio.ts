// Built with `npm run build:portfolio` and vendored into raymondriter.dev at
// public/labs/twist. That host adds exactly one rewrite - `/labs/twist` ->
// `/labs/twist/index.html` - because a broad fallback there would turn every
// missing lab asset into an HTML page. So the portfolio edition routes in the
// hash: only the mounted root is ever requested from the server, and deep
// links like /labs/twist/#/train still survive a reload and a shared URL.
export const isPortfolioBuild = import.meta.env.MODE === 'portfolio'

// Full-document link back out of the lab, into the site that hosts it.
export const portfolioLabsHref = '/labs'

import { waitUntil } from 'async-wait-until';
import { createRoot, type Root } from 'react-dom/client';
import App from './src/App';
import './src/index.css';

let root: Root | null = null;

async function mountApp() {
  await waitGlobalInitialized('Mvu');
  await waitUntil(() => _.has(getVariables({ type: 'message' }), 'stat_data'));

  const container = document.getElementById('app');
  if (!container) {
    throw new Error('找不到 #app 容器');
  }
  root = createRoot(container);
  root.render(<App />);
}

function unmountApp() {
  root?.unmount();
  root = null;
}

$(() => {
  errorCatched(() => {
    void mountApp();
  })();
});

$(window).on('pagehide', () => {
  unmountApp();
});

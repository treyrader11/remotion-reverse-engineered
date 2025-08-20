
import { registerRoot } from 'remotion';
import { App } from './App';

// Register both the Remotion root and the timeline app
registerRoot(() => {
  // Check if we're in Remotion Studio context
  if (typeof window !== 'undefined' && window.location.pathname.includes('/studio')) {
    // Load the Remotion composition for studio
    return import('./Root').then(m => m.RemotionRoot);
  }
  
  // Otherwise load our timeline app with routing
  return App;
});

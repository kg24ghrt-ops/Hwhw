import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'
import { initErrorLogger } from './lib/errorLogger'

// Initialize global error logging
initErrorLogger()

const target = document.getElementById('app');
if (!target) throw new Error('Mount target #app not found');

const app = mount(App, {
  target,
})

export default app

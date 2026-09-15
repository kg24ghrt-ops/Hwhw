import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'
import { initErrorLogger } from './lib/errorLogger'

// Initialize global error logging
initErrorLogger()

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app

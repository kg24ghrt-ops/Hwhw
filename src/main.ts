import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'
import { initializeTheme } from './presentation/stores/themeStore'

// Initialize theme before mounting app
initializeTheme()

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app

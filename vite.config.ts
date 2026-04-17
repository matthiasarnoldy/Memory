import { defineConfig } from 'vite';

export default defineConfig({
  base: "",
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        settings: 'settings.html',
        game: 'game.html',
      }
    }
  }
});
import { defineConfig } from "cypress";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

export default defineConfig({

  reporter: 'cypress-multi-reporters',

  reporterOptions: {
    configFile: 'reporter-config.json',
  },

  e2e: {
    baseUrl: "https://api.realworld.io/api",

     setupNodeEvents(on, config) {
     require('cypress-mochawesome-reporter/plugin')(on);
      return config;
    }
  }

  
});
import { defineConfig } from "orval";

export default defineConfig({
  petstore: {
    input: {
      target: "./swagger.yaml",
    },
    output: {
      mode: "tags-split",
      target: "src/api",
      client: "axios-functions",
      formatter: "oxfmt",
      override: {
        mutator: {
          path: "./src/mutator.ts",
          name: "customInstance",
        },
      },
    },
  },
});

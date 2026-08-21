# React + Vite

This project is built using **React and Vite**, providing a fast and minimal setup for modern React development with **Hot Module Replacement (HMR)** and **Oxlint** support.

## Official Plugins

Currently, two official React plugins are available:

* [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) — uses [Oxc](https://oxc.rs) for React support.
* [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) — uses [SWC](https://swc.rs) for fast compilation.

## React Compiler

The **React Compiler** is not enabled by default because it may have an impact on development and build performance.

To enable the React Compiler, refer to the [official documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint Configuration

For production applications, we recommend using **TypeScript** with type-aware linting rules enabled.

For more information, check out the [Vite React TypeScript template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) and learn how to configure TypeScript and Oxlint for your project.

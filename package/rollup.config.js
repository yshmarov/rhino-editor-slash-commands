import { terser } from '@rollup/plugin-terser';

export default [
  // ES Module build
  {
    input: 'src/index.js',
    output: {
      file: 'dist/rhino-editor-slash-commands.esm.js',
      format: 'es'
    }
  },
  // UMD build
  {
    input: 'src/index.js',
    output: {
      file: 'dist/rhino-editor-slash-commands.js',
      format: 'umd',
      name: 'RhinoSlashCommands'
    }
  },
  // Minified UMD build
  {
    input: 'src/index.js',
    output: {
      file: 'dist/rhino-editor-slash-commands.min.js',
      format: 'umd',
      name: 'RhinoSlashCommands'
    },
    plugins: [terser()]
  }
]; 
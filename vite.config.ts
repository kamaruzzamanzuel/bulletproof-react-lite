import react from '@vitejs/plugin-react';
// import react from '@vitejs/plugin-react-swc';
import { defineConfig, loadEnv, UserConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { createHtmlPlugin } from "vite-plugin-html";
// import svgr from 'vite-plugin-svgr';
import checker from 'vite-plugin-checker';
// import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://medium.com/@ftaioli/using-node-js-builtin-modules-with-vite-6194737c2cd2
// https://stackoverflow.com/questions/72221740/how-do-i-polyfill-the-process-node-module-in-the-vite-dev-server
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
// // No need to add this to deps, it's included by @esbuild-plugins/node-modules-polyfill
// import rollupNodePolyFill from 'rollup-plugin-node-polyfills';

import { esbuildCommonjs, viteCommonjs } from '@originjs/vite-plugin-commonjs';
import commonjs from 'vite-plugin-commonjs';

const envPrefixes = ["VITE_APP", "SERVER_"];

//#region .env file doc

// https://vitejs.dev/guide/env-and-mode.html#env-files
// .env                # loaded in all cases
// .env.local          # loaded in all cases, ignored by git
// .env.[mode]         # only loaded in specified mode
// .env.[mode].local   # only loaded in specified mode, ignored by git

//#endregion

const envDir = "./src/config/envs";

// https://github.com/nordcloud/pat-frontend-template/blob/master/docs/CRA_MIGRATION_GUIDE.md
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, envDir, envPrefixes);
  const buildTimestamp = new Date().valueOf().toString();

  return {
    envDir,
    plugins: [
      react(),
      tsconfigPaths(),
      // svgr(),
      // viteCommonjs(),
      commonjs(),
      checker({
        typescript: env.VITE_APP_IS_TYPE_CHECKER_ENABLED === "true"
      }),
      // https://github.com/vitejs/vite/issues/3105
      createHtmlPlugin({
        inject: {
          data: { env: { ...env, MODE: mode } }
        },
        minify: true
      }),
      // viteStaticCopy({
      //   targets: [
      //     {
      //       src: './src/version-change-tracker/change-version.txt',
      //       dest: 'version-change-tracker'
      //     },
      //     {
      //       src: './src/version-change-tracker/change-tracker.js',
      //       dest: 'version-change-tracker'
      //     }
      //   ]
      // })
    ],
    define: {
      'process.env': process.env,
      'process.env.CUSTOM_ENV': env,
      'process.env.CUSTOM_BUILD_TIME': buildTimestamp,
      '__BUILD_TIMESTAMP__': buildTimestamp,
      '__BUILD_APP_VERSION__': `"${env.VITE_APP_VERSION}"`
    },
    server: {
      port: parseInt(env.SERVER_PORT),
      open: env.SERVER_OPEN_BROWSER === "true" ? `http://localhost:${env.SERVER_PORT}/` : false
      // open: true
    },
    // optimizeDeps: {
    //   esbuildOptions: {
    //     // Node.js global to browser globalThis
    //     // define: {
    //     //   global: 'globalThis'
    //     // },
    //     // Enable esbuild polyfill plugins
    //     plugins: [
    //       // NodeGlobalsPolyfillPlugin({
    //       //   process: true,
    //       //   buffer: true
    //       // }),
    //       // NodeModulesPolyfillPlugin(),
    //       esbuildCommonjs(['mui-file-dropzone'])
    //     ]
    //   }
    // },
    build: {
      outDir: env.SERVER_BUILD_PATH ? env.SERVER_BUILD_PATH.toString()/* .toLowerCase() */ : "build/default",
      commonjsOptions: {
        transformMixedEsModules: true
      },
      rollupOptions: {
        plugins: [
          // Enable rollup polyfills plugin
          // used during production bundling
          // rollupNodePolyFill(),
          // viteCommonjs(),
        ],
        output: {
          // https://rollupjs.org/guide/en/#outputmanualchunks
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          }
        }
      }
    }
  } as UserConfig;
});

// region Replace env variables in index.html
// /**
//  * Replace env variables in index.html
//  * @see https://github.com/vitejs/vite/issues/3105#issuecomment-939703781
//  * @see https://github.com/vitejs/vite/issues/3105#issuecomment-999473946
//  * @see https://vitejs.dev/guide/api-plugin.html#transformindexhtml
//  */
// const htmlPlugin = (data: Record<string, any>) => {
//   return {
//     name: 'html-transform',
//     transformIndexHtml: {
//       enforce: 'pre' as const,
//       transform: (html: string): string =>
//         // html.replace(/<%(.*?)%>/g, (match, group1) => {
//         //   // console.log({ group1 });

//         //   const evaluationString = group1.replace(/env\.([A-Za-z_0-9]*)/g, (match, subGroup1) => {
//         //     // console.log({ match, subGroup1 });

//         //     return env[subGroup1] ?? subGroup1;
//         //   });

//         //   return Function(`return ${evaluationString}`)();
//         // })
//         html.replace(/%(.*?)%/g, (match, p1) =>
//           data.env[p1] ?? match
//         )
//     }
//   };
// };
// endregion
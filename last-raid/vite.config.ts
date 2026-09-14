import {defineConfig} from 'vite';
export default defineConfig({base:'./',build:{target:'es2022',chunkSizeWarningLimit:1600,rollupOptions:{input:process.env.RAID_QA==='1'?['index.html','qa.html','qa-game.html']:['index.html']}},server:{host:'127.0.0.1'}});

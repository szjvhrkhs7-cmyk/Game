// QA-only entry. The ordinary game entry exports no window test API.
import {scene,controls} from './main';
import {unlock,WEAPONS} from './rules';
Object.assign(window,{raidQA:{scene,controls,unlock,WEAPONS}});

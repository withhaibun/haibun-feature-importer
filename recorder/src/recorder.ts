import { runWith } from '@haibun/core/build/lib/run';
import { getDefaultWorld, asFeatures } from '@haibun/core/build/lib/test/lib';
import { getDefaultOptions, getStepperOptionName } from '@haibun/core/build/lib/util';
import WebSocketServer from '@haibun/context/build/websocket-server/websockets-server';
import WebPlaywright from '@haibun/web-playwright';
import StorageFS from '@haibun/storage-fs';
import DomainStorage from '@haibun/domain-storage';
import DomainWebPage from '@haibun/domain-webpage';
import FeatureImporter from '@haibun/feature-importer/build/feature-importer-stepper';
import Haibun from '@haibun/core/build/steps/haibun';
import { readFileSync } from 'fs';

record();

async function record() {
    const specl = getDefaultOptions();
    const { world } = getDefaultWorld(0);
    world.extraOptions = {
        [getStepperOptionName(WebPlaywright, 'STORAGE')]: 'StorageFS',
        [getStepperOptionName(WebPlaywright, 'PERSISTENT_DIRECTORY')]: 'true',
        [getStepperOptionName(WebPlaywright, 'HEADLESS')]: 'false',
        [getStepperOptionName(WebPlaywright, 'ARGS')]: '--disable-extensions-except=./node_modules/@haibun/browser-extension/public/',
    }

    const features = asFeatures([{ path: '/features/record.feature', content: readFileSync('./haibun/features/recorder.feature', 'utf8') }]);
    const backgrounds = asFeatures([{ path: '/backgrounds/extensions.feature', content: readFileSync('./haibun/backgrounds/extensions.feature', 'utf8') }]);

    const result = await runWith({ specl, features, backgrounds, addSteppers: [Haibun, FeatureImporter, WebPlaywright, WebSocketServer, StorageFS, DomainStorage, DomainWebPage], world });
    console.log('🤑', JSON.stringify(result, null, 2));

    return result;
}

import { AStepper, OK, TNamed, TWorld } from '@haibun/core/build/lib/defs';
import { actionNotOK, getFromRuntime } from '@haibun/core/build/lib/util';
import { getFeatures } from './lib/MochaFeatureImporter';
import { IWebSocketServer, TWithContext, WEB_SOCKET_SERVER } from '@haibun/context/build/Context';
import { TControl, TEvent } from './lib/defs';
import ContextFeatureImporter from './lib/ContextFeatureImporter';

const FeatureImporterStepper = class FeatureImporterStepper extends AStepper {
  contextToFeatures: ContextFeatureImporter;

  setWorld(world: TWorld, steppers: AStepper[]) {
    this.world = world;
    this.contextToFeatures = new ContextFeatureImporter(this.getWorld().logger);
    super.setWorld(world, steppers);
  }

  steps = {
    addToWebSocketServer: {
      gwta: 'add browser contexts to WebSocket server',
      action: async () => {
        const webSocketServer: IWebSocketServer = getFromRuntime(this.getWorld().runtime, WEB_SOCKET_SERVER);
        webSocketServer.addContextProcessors({
          '#haibun/event': (message: TWithContext) => this.contextToFeatures.eventToStatement(message as TEvent),
          '#haibun/control': (message: TWithContext) => this.contextToFeatures.controlToStatement(message as TControl)
        });

        return OK;
      }
    },
    haibunMochaFeatureImporter: {
      gwta: `mocha test phrase {what}`,
      action: async ({ what }: TNamed) => {
        const value = getFeatures(what);
        if (value.ok === true) {
          return OK;
        }
        const { message } = value.error;
        return actionNotOK(message, { topics: { haibunFeatureImporter: { summary: message, details: value } } });
      }
    },

    haibunContextFeatureImporter: {
      gwta: `context test phrase {what}`,
      action: async ({ what }: TNamed) => {
        const json = JSON.parse(what);
        const value = this.contextToFeatures.contextToStatement(json);
        return OK;
      }
    },
  }
  constructor() {
    super();
  }
}

export default FeatureImporterStepper;

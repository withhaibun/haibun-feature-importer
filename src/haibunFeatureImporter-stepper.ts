import { AStepper, OK, TNamed, TWorld } from '@haibun/core/build/lib/defs';
import { actionNotOK } from '@haibun/core/build/lib/util';
import { getFeatures } from './lib/haibunFeatureImporter';

class haibunFeatureImporterStepper extends AStepper {
  setWorld(world: TWorld, steppers: AStepper[]) {
    super.setWorld(world, steppers);
  }

  steps = {
    haibunFeatureImporter: {
      gwta: `your test phrase {what}`,
      action: async ({ what }: TNamed) => {
        const value = getFeatures(what);
        if (value.ok === true) {
          return OK;
        }
        const { message } = value.error;
        return actionNotOK(message, { topics: { haibunFeatureImporter: { summary: message, details: value } } });
      }
    },
  }
}

export default haibunFeatureImporterStepper;

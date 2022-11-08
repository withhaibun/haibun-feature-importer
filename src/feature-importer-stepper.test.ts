import { testWithDefaults } from '@haibun/core/build/lib/test/lib';

import FeatureImporter from './feature-importer-stepper';

describe('FeatureImporter test', () => {
  it.only('passes', async () => {
    const feature = { path: '/features/test.feature', content: `your test phrase passes` };
    const result = await testWithDefaults([feature], [FeatureImporter]);
    expect(result.ok).toBe(true);
  });
  it('fails', async () => {
    const feature = { path: '/features/test.feature', content: `your test phrase fails` };
    const result = await testWithDefaults([feature], [FeatureImporter]);
    expect(result.ok).toBe(false);
  });
});

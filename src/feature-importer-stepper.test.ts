import { testWithDefaults } from '@haibun/core/build/lib/test/lib';

import haibunFeatureImporter from './feature-importer-stepper';

describe('haibunFeatureImporter test', () => {
  it.only('passes', async () => {
    const feature = { path: '/features/test.feature', content: `your test phrase passes` };
    const result = await testWithDefaults([feature], [haibunFeatureImporter]);
    expect(result.ok).toBe(true);
  });
  it('fails', async () => {
    const feature = { path: '/features/test.feature', content: `your test phrase fails` };
    const result = await testWithDefaults([feature], [haibunFeatureImporter]);
    expect(result.ok).toBe(false);
  });
});

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { MercadoLibreListingSkill } from './src/skill.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const skillConfig = JSON.parse(readFileSync(join(__dirname, 'skill.json'), 'utf-8'));

export default {
  meta: { name: skillConfig.name, version: skillConfig.version, description: skillConfig.description },
  capabilities: skillConfig.capabilities,
  parameters: skillConfig.parameters,
  async initialize(context) {
    context.state.skill = new MercadoLibreListingSkill();
    return { ready: true };
  },
  async execute(params, context) {
    const { urls, options = {} } = params;
    const result = await context.state.skill.run(urls, options);
    await context.state.skill.cleanup();
    return { success: true, summary: { total: urls.length, file: result.excel.fileName } };
  },
  async cleanup(context) {
    if (context.state.skill) await context.state.skill.cleanup();
  }
};

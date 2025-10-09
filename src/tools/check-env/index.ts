import { Settings } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.check-env.title'),
  path: '/check-env',
  description: translate('tools.check-env.description'),
  keywords: ['check', 'env', 'environment', 'variables', 'config', 'settings', 'devops', 'deployment'],
  component: () => import('./check-env.vue'),
  icon: Settings,
  createdAt: new Date('2025-10-09'),
});


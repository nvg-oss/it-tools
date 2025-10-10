import type { ApiResponse, TabData, Service, EnvVariable } from './check-env.types';

const API_ENDPOINT = 'http://172.22.2.251:8082/check-env.json';

export async function fetchEnvData(): Promise<ApiResponse> {
  const response = await fetch(API_ENDPOINT);
  if (!response.ok) {
    throw new Error(`Failed to fetch env data: ${response.statusText}`);
  }
  return response.json();
}

export function transformApiDataToUI(apiResponse: ApiResponse): TabData[] {
  const tabs: TabData[] = [];

  // Process each tab (ai, backend, frontend, etc.)
  Object.entries(apiResponse.data).forEach(([tabKey, tabData]) => {
    const services: Service[] = [];

    // Process each service
    Object.entries(tabData.services || {}).forEach(([serviceName, serviceData]) => {
      // Collect all unique keys from all environments in all modules
      const allKeysSet = new Set<string>();
      const keyToEnvValues: Record<string, { dev?: string; staging?: string; production?: string }> = {};

      // Process each module
      Object.entries(serviceData.modules || {}).forEach(([moduleName, moduleData]) => {
        const { envs } = moduleData;

        if (!envs) return;

        // Collect keys from dev environment
        if (envs.dev?.key) {
          Object.keys(envs.dev.key).forEach((key) => {
            allKeysSet.add(key);
            if (!keyToEnvValues[key]) {
              keyToEnvValues[key] = {};
            }
            keyToEnvValues[key].dev = envs.dev.key[key];
          });
        }

        // Collect keys from staging environment
        if (envs.staging?.key) {
          Object.keys(envs.staging.key).forEach((key) => {
            allKeysSet.add(key);
            if (!keyToEnvValues[key]) {
              keyToEnvValues[key] = {};
            }
            keyToEnvValues[key].staging = envs.staging.key[key];
          });
        }

        // Collect keys from production environment
        if (envs.production?.key) {
          Object.keys(envs.production.key).forEach((key) => {
            allKeysSet.add(key);
            if (!keyToEnvValues[key]) {
              keyToEnvValues[key] = {};
            }
            keyToEnvValues[key].production = envs.production.key[key];
          });
        }
      });

      // Convert to array of variables
      const variables: EnvVariable[] = Array.from(allKeysSet).map((key) => {
        const envValues = keyToEnvValues[key] || {};
        return {
          key,
          dev: envValues.dev !== undefined ? envValues.dev : null,
          staging: envValues.staging !== undefined ? envValues.staging : null,
          production: envValues.production !== undefined ? envValues.production : null,
        };
      });

      // Only add service if it has variables
      if (variables.length > 0) {
        services.push({
          id: serviceName,
          name: serviceName.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' '),
          variables,
        });
      }
    });

    // Only add tab if it has services
    if (services.length > 0) {
      tabs.push({
        id: tabKey as 'ai' | 'backend' | 'frontend',
        name: tabKey.charAt(0).toUpperCase() + tabKey.slice(1),
        services,
      });
    }
  });

  return tabs;
}

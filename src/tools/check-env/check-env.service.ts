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
      const variables: EnvVariable[] = [];

      // Process each module
      Object.entries(serviceData.modules || {}).forEach(([moduleName, moduleData]) => {
        const { all_keys, envs } = moduleData;

        if (!all_keys) return;

        // Create variables from ALL_KEYS
        Object.keys(all_keys).forEach((key) => {
          const variable: EnvVariable = {
            key,
            dev: null,
            staging: null,
            production: null,
          };

          // Check if key exists in each environment
          if (envs?.dev?.key && key in envs.dev.key) {
            variable.dev = envs.dev.key[key]; // Mark as exists
          }
          if (envs?.staging?.key && key in envs.staging.key) {
            variable.staging = envs.staging.key[key]; // Mark as exists
          }
          if (envs?.production?.key && key in envs.production.key) {
            variable.production = envs.production.key[key]; // Mark as exists
          }

          variables.push(variable);
        });
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

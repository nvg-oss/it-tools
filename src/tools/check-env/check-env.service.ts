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

  // Process each tab (ai, backend, frontend)
  Object.entries(apiResponse.data).forEach(([tabKey, tabData]) => {
    const services: Service[] = [];

    // Process each service
    Object.entries(tabData.services).forEach(([serviceName, serviceData]) => {
      // Merge all modules into one service (since usually service name = module name)
      const allVariables = new Map<string, EnvVariable>();

      // Process each module
      Object.entries(serviceData.modules).forEach(([moduleName, moduleData]) => {
        const { all_keys, Envs } = moduleData;

        // Create variables from all_keys
        Object.keys(all_keys).forEach((key) => {
          if (!allVariables.has(key)) {
            allVariables.set(key, {
              key,
              dev: null,
              staging: null,
              production: null,
            });
          }

          // Fill in environment values
          const variable = allVariables.get(key);
          if (variable) {
            // Dev environment
            if (Envs.dev?.Key[key] !== undefined) {
              variable.dev = Envs.dev.Key[key] || '';
            }
            // Staging environment
            if (Envs.staging?.Key[key] !== undefined) {
              variable.staging = Envs.staging.Key[key] || '';
            }
            // Production environment
            if (Envs.production?.Key[key] !== undefined) {
              variable.production = Envs.production.Key[key] || '';
            }
          }
        });
      });

      // Convert map to array
      const variables = Array.from(allVariables.values());

      services.push({
        id: serviceName,
        name: serviceName.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' '),
        variables,
      });
    });

    tabs.push({
      id: tabKey as 'ai' | 'backend' | 'frontend',
      name: tabKey.charAt(0).toUpperCase() + tabKey.slice(1),
      services,
    });
  });

  return tabs;
}


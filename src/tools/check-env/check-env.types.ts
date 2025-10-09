// API Response Types
export interface ApiEnvValues {
  [key: string]: string;
}

export interface ApiEnvironment {
  Key: ApiEnvValues;
}

export interface ApiEnvironments {
  dev?: ApiEnvironment;
  staging?: ApiEnvironment;
  production?: ApiEnvironment;
}

export interface ApiModule {
  Envs: ApiEnvironments;
  all_keys: ApiEnvValues;
}

export interface ApiModules {
  [moduleName: string]: ApiModule;
}

export interface ApiService {
  modules: ApiModules;
}

export interface ApiServices {
  [serviceName: string]: ApiService;
}

export interface ApiTabData {
  services: ApiServices;
}

export interface ApiResponse {
  data: {
    ai: ApiTabData;
    backend: ApiTabData;
    frontend: ApiTabData;
  };
}

// UI Types
export interface EnvVariable {
  key: string;
  dev: string | null;  // null means environment not available
  staging: string | null;
  production: string | null;
}

export interface Service {
  id: string;
  name: string;
  variables: EnvVariable[];
}

export type TabType = 'ai' | 'backend' | 'frontend';

export interface TabData {
  id: TabType;
  name: string;
  services: Service[];
}


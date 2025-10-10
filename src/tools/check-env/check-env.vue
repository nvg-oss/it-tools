<script setup lang="ts">
import { useCopy } from '@/composable/copy';
import { fetchEnvData, transformApiDataToUI } from './check-env.service';
import type { EnvVariable, Service, TabType, TabData } from './check-env.types';

const { t } = useI18n();

// Loading state
const isLoading = ref(false);
const loadError = ref<string | null>(null);

// Active tab
const activeTab = ref<TabType>('ai');

// Active service per tab
const activeServicePerTab = ref<Record<TabType, string>>({
  ai: 'email',
  backend: 'database',
  frontend: 'state',
});

// Tabs data with services
const tabs = ref<TabData[]>([
  {
    id: 'ai',
    name: 'AI',
    services: [
      {
        id: 'email',
        name: 'Email Service',
        variables: [],
      },
      {
        id: 'authen',
        name: 'Authen Service',
        variables: [],
      },
      {
        id: 'chatgpt',
        name: 'ChatGPT Service',
        variables: [],
      },
    ],
  },
  {
    id: 'backend',
    name: 'Backend',
    services: [
      {
        id: 'database',
        name: 'Database Service',
        variables: [],
      },
      {
        id: 'api',
        name: 'API Service',
        variables: [],
      },
      {
        id: 'cache',
        name: 'Cache Service',
        variables: [],
      },
    ],
  },
  {
    id: 'frontend',
    name: 'Frontend',
    services: [
      {
        id: 'state',
        name: 'State Management',
        variables: [],
      },
      {
        id: 'routing',
        name: 'Routing Service',
        variables: [],
      },
      {
        id: 'ui',
        name: 'UI Components',
        variables: [],
      },
    ],
  },
]);

// Active tab data
const activeTabData = computed(() => 
  tabs.value.find(tab => tab.id === activeTab.value) || tabs.value[0]
);

// Active service
const activeServiceId = computed({
  get: () => activeServicePerTab.value[activeTab.value],
  set: (value: string) => {
    activeServicePerTab.value[activeTab.value] = value;
  },
});

const activeService = computed(() => 
  activeTabData.value.services.find(s => s.id === activeServiceId.value) || activeTabData.value.services[0]
);

// Switch tab
const switchTab = (tabId: TabType) => {
  activeTab.value = tabId;
};

// Add new variable to active service
const addVariable = () => {
  if (activeService.value) {
    activeService.value.variables.push({
      key: '',
      dev: '',
      staging: '',
      production: '',
    });
  }
};

// Remove variable
const removeVariable = (index: number) => {
  if (activeService.value) {
    activeService.value.variables.splice(index, 1);
  }
};

// Add new service to active tab
const showAddServiceModal = ref(false);
const newServiceName = ref('');

const addService = () => {
  if (newServiceName.value.trim() && activeTabData.value) {
    const id = newServiceName.value.toLowerCase().replace(/\s+/g, '-');
    activeTabData.value.services.push({
      id,
      name: newServiceName.value,
      variables: [],
    });
    activeServiceId.value = id;
    newServiceName.value = '';
    showAddServiceModal.value = false;
  }
};

// Remove service
const removeService = (serviceId: string) => {
  if (!activeTabData.value) return;
  
  const index = activeTabData.value.services.findIndex(s => s.id === serviceId);
  if (index > -1 && activeTabData.value.services.length > 1) {
    activeTabData.value.services.splice(index, 1);
    if (activeServiceId.value === serviceId) {
      activeServiceId.value = activeTabData.value.services[0].id;
    }
  }
};

// Load data from API
const loadFromAPI = async () => {
  isLoading.value = true;
  loadError.value = null;
  
  try {
    const apiResponse = await fetchEnvData();
    const transformedData = transformApiDataToUI(apiResponse);
    
    // Update tabs data
    tabs.value = transformedData;
    
    // Reset active states
    activeTab.value = 'ai';
    activeServicePerTab.value = {
      ai: transformedData[0]?.services[0]?.id || '',
      backend: transformedData[1]?.services[0]?.id || '',
      frontend: transformedData[2]?.services[0]?.id || '',
    };
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : 'Failed to load data';
    console.error('Failed to load env data:', error);
  } finally {
    isLoading.value = false;
  }
};

// Load sample data
const loadSampleData = () => {
  tabs.value = [
    {
      id: 'ai',
      name: 'AI',
      services: [
        {
          id: 'email',
          name: 'Email Service',
          variables: [
            { key: 'SMTP_HOST', dev: 'smtp.mailtrap.io', staging: 'smtp.sendgrid.net', production: 'smtp.gmail.com' },
            { key: 'SMTP_PORT', dev: '2525', staging: '587', production: '587' },
            { key: 'SMTP_USER', dev: 'test_user', staging: 'staging_user', production: 'prod_user' },
            { key: 'FROM_EMAIL', dev: 'dev@test.com', staging: 'staging@company.com', production: 'noreply@company.com' },
          ],
        },
        {
          id: 'authen',
          name: 'Authen Service',
          variables: [
            { key: 'JWT_SECRET', dev: 'dev_secret_123', staging: 'staging_secret_456', production: 'prod_secret_789' },
            { key: 'JWT_EXPIRES_IN', dev: '7d', staging: '3d', production: '1d' },
            { key: 'OAUTH_CLIENT_ID', dev: 'dev_client_id', staging: 'staging_client_id', production: 'prod_client_id' },
          ],
        },
        {
          id: 'chatgpt',
          name: 'ChatGPT Service',
          variables: [
            { key: 'OPENAI_API_KEY', dev: 'sk-dev-xxx', staging: 'sk-staging-xxx', production: 'sk-prod-xxx' },
            { key: 'OPENAI_MODEL', dev: 'gpt-3.5-turbo', staging: 'gpt-4', production: 'gpt-4' },
            { key: 'MAX_TOKENS', dev: '1000', staging: '2000', production: '4000' },
          ],
        },
      ],
    },
    {
      id: 'backend',
      name: 'Backend',
      services: [
        {
          id: 'database',
          name: 'Database Service',
          variables: [
            { key: 'DB_HOST', dev: 'localhost', staging: 'staging-db.internal', production: 'prod-db.internal' },
            { key: 'DB_PORT', dev: '5432', staging: '5432', production: '5432' },
            { key: 'DB_NAME', dev: 'myapp_dev', staging: 'myapp_staging', production: 'myapp_production' },
            { key: 'DB_USER', dev: 'dev_user', staging: 'staging_user', production: 'prod_user' },
          ],
        },
        {
          id: 'api',
          name: 'API Service',
          variables: [
            { key: 'API_URL', dev: 'http://localhost:3000', staging: 'https://api-staging.com', production: 'https://api.company.com' },
            { key: 'API_TIMEOUT', dev: '30000', staging: '15000', production: '10000' },
            { key: 'RATE_LIMIT', dev: '1000', staging: '500', production: '100' },
          ],
        },
        {
          id: 'cache',
          name: 'Cache Service',
          variables: [
            { key: 'REDIS_HOST', dev: 'localhost', staging: 'redis-staging.internal', production: 'redis-prod.internal' },
            { key: 'REDIS_PORT', dev: '6379', staging: '6379', production: '6379' },
            { key: 'CACHE_TTL', dev: '3600', staging: '1800', production: '600' },
          ],
        },
      ],
    },
    {
      id: 'frontend',
      name: 'Frontend',
      services: [
        {
          id: 'state',
          name: 'State Management',
          variables: [
            { key: 'VITE_APP_NAME', dev: 'MyApp Dev', staging: 'MyApp Staging', production: 'MyApp' },
            { key: 'VITE_DEBUG', dev: 'true', staging: 'true', production: 'false' },
            { key: 'VITE_LOG_LEVEL', dev: 'debug', staging: 'info', production: 'error' },
          ],
        },
        {
          id: 'routing',
          name: 'Routing Service',
          variables: [
            { key: 'VITE_BASE_URL', dev: '/', staging: '/app/', production: '/app/' },
            { key: 'VITE_ROUTER_MODE', dev: 'hash', staging: 'history', production: 'history' },
          ],
        },
        {
          id: 'ui',
          name: 'UI Components',
          variables: [
            { key: 'VITE_THEME', dev: 'light', staging: 'auto', production: 'auto' },
            { key: 'VITE_PRIMARY_COLOR', dev: '#1890ff', staging: '#52c41a', production: '#1890ff' },
          ],
        },
      ],
    },
  ];
  activeTab.value = 'ai';
  activeServicePerTab.value = {
    ai: 'email',
    backend: 'database',
    frontend: 'state',
  };
};

// Export functions
const exportToEnv = (environment: 'dev' | 'staging' | 'production') => {
  if (!activeService.value) return '';
  
  const envContent = activeService.value.variables
    .filter(v => v.key && v[environment] !== null && v[environment] !== '')
    .map(v => `${v.key}=${v[environment]}`)
    .join('\n');
  
  return envContent;
};

const { copy: copyDev } = useCopy({ 
  source: computed(() => exportToEnv('dev')),
  text: 'Dev environment copied!' 
});

const { copy: copyStaging } = useCopy({ 
  source: computed(() => exportToEnv('staging')),
  text: 'Staging environment copied!' 
});

const { copy: copyProduction } = useCopy({ 
  source: computed(() => exportToEnv('production')),
  text: 'Production environment copied!' 
});

// Statistics
const stats = computed(() => {
  if (!activeService.value) {
    return { total: 0, filled: 0, missing: 0 };
  }
  
  const total = activeService.value.variables.length;
  let filled = 0;
  let missing = 0;
  
  activeService.value.variables.forEach(v => {
    if (v.key && v.dev && v.staging && v.production) {
      filled++;
    } else if (v.key) {
      missing++;
    }
  });
  
  return { total, filled, missing };
});

// Auto-load data from API on mount
onMounted(() => {
  loadFromAPI();
});
</script>

<template>
  <div>
    <!-- Header with actions -->
    <c-card mb-3>
      <div flex items-center justify-between>
        <div>
          <h2 text-xl font-bold>{{ t('tools.check-env.title') }}</h2>
        </div>
        <div flex gap-2>
          <c-button 
            size="small" 
            :loading="isLoading"
            @click="loadFromAPI"
          >
            Load from API
          </c-button>
        </div>
      </div>

      <!-- Error Message -->
      <n-alert
        v-if="loadError"
        type="error"
        closable
        mt-3
        @close="loadError = null"
      >
        {{ loadError }}
      </n-alert>

      <!-- 3 Tabs: AI, Backend, Frontend -->
      <div mt-4 flex gap-3>
        <div
          v-for="tab in tabs"
          :key="tab.id"
          class="tab-item"
          :class="{ active: activeTab === tab.id }"
          @click="switchTab(tab.id)"
        >
          <div class="tab-content">
            <div text-lg font-bold>
              {{ tab.name }}
            </div>
            <div text-xs op-60 mt-1>
              {{ tab.services.reduce((sum, s) => sum + s.variables.length, 0) }} variables
            </div>
          </div>
        </div>
      </div>
    </c-card>

    <!-- Main layout: 2 columns -->
    <div flex gap-3>
      <!-- Left Column: Services List (30%) -->
      <c-card style="width: 30%; min-height: 500px;" pa-0>
        <div pa-4 border-b>
          <h3 font-semibold>Services - {{ activeTabData?.name }}</h3>
        </div>
        
        <div class="services-list">
          <div
            v-for="service in activeTabData?.services"
            :key="service.id"
            class="service-item"
            :class="{ active: activeServiceId === service.id }"
            @click="activeServiceId = service.id"
          >
            <div flex items-center justify-between>
              <div flex items-center gap-2>
                <div
                  w-2
                  h-2
                  rounded-full
                  :class="service.variables.length > 0 ? 'bg-green-500' : 'bg-gray-400'"
                />
                <span>{{ service.name }}</span>
              </div>
              <div
                v-if="activeTabData && activeTabData.services.length > 1"
                class="delete-btn"
                @click.stop="removeService(service.id)"
              >
                <icon-mdi:close text-sm />
              </div>
            </div>
            <div text-xs op-60 mt-1 ml-4>
              {{ service.variables.length }} variables
            </div>
          </div>
        </div>
      </c-card>

      <!-- Right Column: Environment Variables Table (70%) -->
      <c-card style="width: 70%;" class="env-table-card">
        <div flex items-center justify-between mb-3>
          <h3 font-semibold text-lg>
            {{ activeService?.name }}
          </h3>
          <div flex gap-2>
            <c-button size="small" @click="addVariable">
              + Add Variable
            </c-button>
            <n-dropdown
              trigger="hover"
              :options="[
                { label: 'Copy Dev Env', key: 'dev' },
                { label: 'Copy Staging Env', key: 'staging' },
                { label: 'Copy Production Env', key: 'production' },
              ]"
              @select="(key: string) => {
                if (key === 'dev') copyDev();
                else if (key === 'staging') copyStaging();
                else if (key === 'production') copyProduction();
              }"
            >
              <c-button size="small">
                Export
              </c-button>
            </n-dropdown>
          </div>
        </div>

        <!-- Table -->
        <div class="env-table-wrapper">
          <table class="env-table">
            <thead>
              <tr>
                <th style="width: 40%">Key</th>
                <th style="width: 20%" text-center>Dev Env</th>
                <th style="width: 20%" text-center>Staging Env</th>
                <th style="width: 20%" text-center>Pro Env</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="activeService?.variables.length === 0">
                <td colspan="4" text-center op-50 py-8>
                  No variables found in this service.
                </td>
              </tr>
              <tr
                v-for="(variable, index) in activeService?.variables"
                :key="index"
              >
                <td>
                  <span font-mono font-semibold text-sm>
                    {{ variable.key }}
                  </span>
                </td>
                <td :class="{ 'env-exists': variable.dev !== null }" class="env-cell">
                  <div v-if="variable.dev !== null" class="env-indicator">
                    <icon-mdi:close text-xl />
                  </div>
                </td>
                <td :class="{ 'env-exists': variable.staging !== null }" class="env-cell">
                  <div v-if="variable.staging !== null" class="env-indicator">
                    <icon-mdi:close text-xl />
                  </div>
                </td>
                <td :class="{ 'env-exists': variable.production !== null }" class="env-cell">
                  <div v-if="variable.production !== null" class="env-indicator">
                    <icon-mdi:close text-xl />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div mt-3 text-xs op-60>
          <div flex items-center gap-2>
            <div w-5 h-5 bg-red-100 border="1 red-400" flex items-center justify-center>
              <icon-mdi:close text-xs text-red-600 />
            </div>
            <span>Red background with <strong>✗</strong> icon means key exists in that environment</span>
          </div>
        </div>
      </c-card>
    </div>

    <!-- Add Service Modal -->
    <n-modal v-model:show="showAddServiceModal">
      <n-card
        style="width: 400px"
        title="Add New Service"
        :bordered="false"
        size="small"
      >
        <n-form>
          <n-form-item label="Service Name">
            <n-input
              v-model:value="newServiceName"
              placeholder="e.g., Payment Service"
              @keyup.enter="addService"
            />
          </n-form-item>
        </n-form>
        
        <template #footer>
          <div flex justify-end gap-2>
            <c-button @click="showAddServiceModal = false">
              Cancel
            </c-button>
            <c-button @click="addService">
              Add Service
            </c-button>
          </div>
        </template>
      </n-card>
    </n-modal>
  </div>
</template>

<style scoped lang="less">
.tab-item {
  flex: 1;
  padding: 16px;
  border-radius: 8px;
  border: 2px solid rgba(128, 128, 128, 0.2);
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;

  &:hover {
    border-color: rgba(24, 160, 88, 0.5);
    background-color: rgba(24, 160, 88, 0.05);
    transform: translateY(-2px);
  }

  &.active {
    border-color: rgb(24, 160, 88);
    background-color: rgba(24, 160, 88, 0.1);
    box-shadow: 0 4px 12px rgba(24, 160, 88, 0.2);

    .tab-content {
      color: rgb(24, 160, 88);
    }
  }

  .tab-content {
    transition: color 0.3s;
  }
}

.services-list {
  .service-item {
    padding: 12px 16px;
    cursor: pointer;
    transition: all 0.2s;
    border-left: 3px solid transparent;

    &:hover {
      background-color: rgba(128, 128, 128, 0.05);
    }

    &.active {
      background-color: rgba(24, 160, 88, 0.1);
      border-left-color: rgb(24, 160, 88);
    }

    .delete-btn {
      opacity: 0;
      transition: opacity 0.2s;
      padding: 2px;
      border-radius: 4px;

      &:hover {
        background-color: rgba(255, 0, 0, 0.1);
      }
    }

    &:hover .delete-btn {
      opacity: 1;
    }
  }
}

.env-table-card {
  ::v-deep(.n-card__content) {
    padding: 16px;
  }
}

.env-table-wrapper {
  overflow-x: auto;
  border: 1px solid rgba(128, 128, 128, 0.2);
  border-radius: 4px;
}

.env-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  th {
    background-color: rgba(128, 128, 128, 0.1);
    padding: 10px 8px;
    text-align: left;
    font-weight: 600;
    border-bottom: 2px solid rgba(128, 128, 128, 0.2);
    white-space: nowrap;
  }

  td {
    padding: 8px;
    border-bottom: 1px solid rgba(128, 128, 128, 0.1);
  }

  tbody tr {
    transition: background-color 0.2s;

    &:hover {
      background-color: rgba(128, 128, 128, 0.03);
    }
  }

  ::v-deep(.n-input) {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  }
}

.env-cell {
  text-align: center;
  vertical-align: middle;
}

.env-exists {
  background-color: rgba(255, 0, 0, 0.1);
  
  &:hover {
    background-color: rgba(255, 0, 0, 0.15);
  }
}

.env-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d32f2f;
  font-weight: 600;
}
</style>

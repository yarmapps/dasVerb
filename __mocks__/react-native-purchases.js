const mockPurchases = {
  configure: jest.fn(),
  setLogLevel: jest.fn(),
  getOfferings: jest.fn().mockResolvedValue({ current: null, all: {} }),
  getCustomerInfo: jest.fn().mockResolvedValue({ entitlements: { active: {}, all: {} } }),
  purchasePackage: jest.fn().mockResolvedValue({
    customerInfo: { entitlements: { active: { premium: {} }, all: {} } },
  }),
  restorePurchases: jest.fn().mockResolvedValue({
    entitlements: { active: { premium: {} }, all: {} },
  }),
  addCustomerInfoUpdateListener: jest.fn(() => jest.fn()),
  getAppUserID: jest.fn().mockResolvedValue('mock-user-id'),
  showManageSubscriptions: jest.fn().mockResolvedValue(undefined),
};

module.exports = {
  __esModule: true,
  default: mockPurchases,
  LOG_LEVEL: {
    VERBOSE: 'VERBOSE',
    DEBUG: 'DEBUG',
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR',
  },
  PACKAGE_TYPE: {
    UNKNOWN: 'UNKNOWN',
    CUSTOM: 'CUSTOM',
    LIFETIME: 'LIFETIME',
    ANNUAL: 'ANNUAL',
    SIX_MONTH: 'SIX_MONTH',
    THREE_MONTH: 'THREE_MONTH',
    TWO_MONTH: 'TWO_MONTH',
    MONTHLY: 'MONTHLY',
    WEEKLY: 'WEEKLY',
  },
};

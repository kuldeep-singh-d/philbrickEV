export const routes = Object.freeze({
  auth: {
    login: 'login',
    registration: 'registration',
    forgotPassword: 'forgotPassword',
    authBranch: 'authBranch',
  },

  app: {
    tabs: 'tabs',

    profile: 'profile',
    branches: 'branches',
    dashboard: 'dashboard',
    transaction: 'transaction',
  },

  reports: {
    reports: 'reports',
    itemLedgerReport: 'itemLedgerReport',
    designStockReport: 'designStockReport',
    stockSummaryReport: 'stockSummaryReport',
    branchSaleStockSummaryReport: 'branchSaleStockSummaryReport',
  },
  transactions: {
    grnTransfer: 'grnTransfer',
    itemPhotoUpload: 'itemPhotoUpload',
    locationTransfer: 'locationTransfer',
  },
});

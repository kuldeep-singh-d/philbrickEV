export const methods = {
  GET: 'GET',
  PUT: 'PUT',
  POST: 'POST',
  DELETE: 'DELETE',
};

export const apiRoutes = {
  login: '/api/login',
  logout: '/api/logout',
  profile: '/api/profile',
  visitors: '/api/visitors',
  dashboard: '/api/dashboard',
  addVisitor: '/api/visitors',
  rejectVisitor: '/api/visitors/',
  acceptVisitor: '/api/visitors/',
  visitorDetail: '/api/visitors/',
  approveVisitor: '/api/visitors/',
  checkoutVisitor: '/api/visitors/',
  updateProfile: '/api/profile/update',
  materialInwards: '/api/material-inwards',
  materialInwardDetail: '/api/material-inwards/',
  saveFCM: '/api/save-fcm-token?fcm_token=',
  materialOutwards: '/api/material-outwards',
  materialOutwardDetail: '/api/material-outwards/',
  getVisitorByNumber: '/api/visitor-by-mobile',

  personToMeet: '/api/person-to-meet',
  visitorTypes: '/api/visitor-types',
  suppliers: '/api/suppliers',
  materialUnits: '/api/material-units',
  customers: '/api/customers',
  getPermissions: '/api/my-permissions',

  getNotifications: 'notifications',
  readAllNotifications: 'notifications/read-all',

  vcards: '/api/vcards',
  packingUsers: `/api/material-inwards/packing-users`,
  securityUsers: `/api/material-outwards/security-users`,
  markAsReadyInward: '/api/material-inwards/',
  markAsReadyOutward: '/api/material-outwards/',
};

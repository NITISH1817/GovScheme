const API_BASE_URL = 'http://localhost:5000/api';

const getMockData = (endpoint: string) => {
  if (endpoint.includes('/schemes')) {
    return {
      success: true,
      schemes: [
        { _id: '1', id: 'PM-KISAN', name: 'Pradhan Mantri Kisan Samman Nidhi', department: 'Agriculture', state: 'Central', category: 'Agriculture', status: 'Published' },
        { _id: '2', id: 'PMS', name: 'Post Matric Scholarship', department: 'Education', state: 'Maharashtra', category: 'Education', status: 'Draft' },
        { _id: '3', id: 'NFBS', name: 'National Family Benefit Scheme', department: 'Social Welfare', state: 'Central', category: 'Financial', status: 'Published' },
      ],
      pages: 1,
      total: 3
    };
  }
  if (endpoint.includes('/applications')) {
    return {
      success: true,
      applications: [
        { _id: 'app1', citizenName: 'Jane Smith', schemeName: 'PM Kisan Samman Nidhi', status: 'Pending', submittedAt: new Date().toISOString(), state: 'Maharashtra' },
        { _id: 'app2', citizenName: 'Rahul Verma', schemeName: 'Post Matric Scholarship', status: 'Approved', submittedAt: new Date(Date.now() - 86400000).toISOString(), state: 'Karnataka' },
      ]
    };
  }
  if (endpoint.includes('/users')) {
    return {
      success: true,
      users: [
        { id: 'u1', name: 'Jane Smith', email: 'jane@example.com', state: 'Maharashtra', joinedAt: new Date().toISOString() },
        { id: 'u2', name: 'Rahul Verma', email: 'rahul@example.com', state: 'Karnataka', joinedAt: new Date(Date.now() - 86400000).toISOString() },
      ]
    };
  }
  if (endpoint.includes('/notifications')) {
    return {
      success: true,
      notifications: [
        { id: 'n1', title: 'New Application', message: 'Jane Smith applied for PM Kisan', time: '10 min ago', read: false },
        { id: 'n2', title: 'System Alert', message: 'High traffic detected', time: '1 hour ago', read: true },
      ]
    };
  }
  if (endpoint.includes('/audit')) {
    return {
      success: true,
      logs: [
        { id: 'a1', user: 'Super Admin', action: 'Updated Scheme', details: 'Edited PM Kisan', timestamp: new Date().toISOString() },
        { id: 'a2', user: 'Super Admin', action: 'Login', details: 'Successful login', timestamp: new Date().toISOString() },
      ]
    };
  }
  if (endpoint.includes('/reports')) {
    return {
      success: true,
      data: [
        { id: 'r1', name: 'Monthly Distribution Report', type: 'PDF', date: new Date().toISOString(), size: '2.4 MB' },
        { id: 'r2', name: 'Application Processing Times', type: 'CSV', date: new Date(Date.now() - 86400000).toISOString(), size: '1.1 MB' },
      ]
    };
  }
  if (endpoint.includes('/analytics/dashboard')) {
    return {
      success: true,
      metrics: {
        totalSchemes: 142, publishedSchemes: 118, draftSchemes: 20, archivedSchemes: 4,
        totalCitizens: 24500, activeUsers: 8400, todayRegistrations: 124,
        totalApplications: 15400, approvedApps: 9200, pendingApps: 5100, rejectedApps: 1100,
        ocrRequests: 4200, aiRequests: 18500, voiceRequests: 3200, storageUsed: '4.2', apiHealth: 99.9,
      },
      charts: {
        userGrowth: [ { name: 'Jan', users: 4000, applications: 2400 }, { name: 'Feb', users: 5000, applications: 3398 } ],
        applicationsByStatus: [ { name: 'Approved', value: 9200 }, { name: 'Pending', value: 5100 }, { name: 'Rejected', value: 1100 } ],
        schemesByState: [ { name: 'Maharashtra', value: 45 }, { name: 'Karnataka', value: 38 } ],
        dailyTraffic: [ { name: 'Mon', requests: 1200, ocr: 400, ai: 800 }, { name: 'Tue', requests: 1800, ocr: 600, ai: 1200 } ]
      }
    };
  }
  return { success: true, data: [] };
};

const getHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

const handleResponse = async (response: Response) => {
  if (response.status === 401) {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/admin'; // Force reload to login screen
    throw new Error('Session expired. Please log in again.');
  }
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return await response.json();
};

export const apiClient = {
  get: async (endpoint: string, params: Record<string, any> = {}) => {
    try {
      const url = new URL(`${API_BASE_URL}${endpoint}`);
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== '') {
          url.searchParams.append(key, String(params[key]));
        }
      });
      
      const response = await fetch(url.toString(), {
        headers: getHeaders()
      });
      return await handleResponse(response);
    } catch (e) {
      console.warn("Offline mock fallback for GET", endpoint);
      return getMockData(endpoint);
    }
  },

  post: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  put: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  delete: async (endpoint: string) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(response);
  }
};

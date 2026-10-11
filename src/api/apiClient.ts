const API_BASE_URL = 'http://localhost:5000/api';

const getMockData = (endpoint: string) => {
  if (endpoint.includes('/schemes')) {
    return {
      success: true,
      schemes: [
        { 
          _id: '1', 
          id: 'PM-KISAN', 
          name: 'Pradhan Mantri Kisan Samman Nidhi', 
          department: 'Ministry of Agriculture and Farmers Welfare', 
          state: 'Central', 
          category: 'Agriculture', 
          shortDescription: 'Income support of ₹6,000 per year in three equal installments to all landholding farmer families.', 
          status: 'Published',
          popularityScore: 98,
          benefits: '₹6,000 per annum paid directly to bank accounts.',
          officialApplyUrl: 'https://pmkisan.gov.in',
          applyURL: 'https://pmkisan.gov.in',
          documentsRequired: ['Aadhaar', 'Land Ownership Records', 'Bank Passbook'],
          eligibilityRules: { ageMin: 18, ageMax: 80, incomeLimit: 0, category: ['All'], occupation: ['Farmer'] },
          updatedAt: new Date().toISOString()
        },
        { 
          _id: '2', 
          id: 'PMS-EDU', 
          name: 'Post Matric Scholarship for Students', 
          department: 'Ministry of Social Justice and Empowerment', 
          state: 'Maharashtra', 
          category: 'Education', 
          shortDescription: 'Financial assistance for post-matriculation or secondary stage studies for eligible students.', 
          status: 'Published',
          popularityScore: 85,
          benefits: 'Full tuition reimbursement + monthly maintenance allowance.',
          officialApplyUrl: 'https://scholarships.gov.in',
          applyURL: 'https://scholarships.gov.in',
          documentsRequired: ['Aadhaar', 'Income Certificate', 'Community Certificate', 'Mark Sheet'],
          eligibilityRules: { ageMin: 15, ageMax: 30, incomeLimit: 250000, category: ['SC', 'ST', 'OBC'] },
          updatedAt: new Date(Date.now() - 86400000).toISOString()
        },
        { 
          _id: '3', 
          id: 'NFBS-BEN', 
          name: 'National Family Benefit Scheme', 
          department: 'Ministry of Rural Development', 
          state: 'Central', 
          category: 'Financial', 
          shortDescription: 'Lump sum family benefit of ₹20,000 on the death of the primary breadwinner in a BPL family.', 
          status: 'Published',
          popularityScore: 72,
          benefits: 'One-time grant of ₹20,000 to the bereaved household.',
          officialApplyUrl: 'https://nsap.nic.in',
          applyURL: 'https://nsap.nic.in',
          documentsRequired: ['Death Certificate', 'BPL Ration Card', 'Aadhaar', 'Bank Passbook'],
          eligibilityRules: { ageMin: 18, ageMax: 64, incomeLimit: 50000, category: ['All'] },
          updatedAt: new Date(Date.now() - 172800000).toISOString()
        },
        { 
          _id: '4', 
          id: 'PMAY-URBAN', 
          name: 'Pradhan Mantri Awas Yojana (Urban)', 
          department: 'Ministry of Housing and Urban Affairs', 
          state: 'Central', 
          category: 'Housing', 
          shortDescription: 'Affordable pucca housing for all eligible families in urban areas.', 
          status: 'Draft',
          popularityScore: 0,
          benefits: 'Interest subsidy up to ₹2.67 Lakhs on housing loans.',
          officialApplyUrl: 'https://pmaymis.gov.in',
          applyURL: 'https://pmaymis.gov.in',
          documentsRequired: ['Aadhaar', 'PAN', 'Income Certificate', 'Property Ownership Proof'],
          eligibilityRules: { ageMin: 21, ageMax: 70, incomeLimit: 600000, category: ['All'] },
          updatedAt: new Date(Date.now() - 259200000).toISOString()
        }
      ],
      pages: 1,
      total: 4
    };
  }
  if (endpoint.includes('/documents')) {
    return {
      success: true,
      total: 3,
      page: 1,
      pages: 1,
      documents: [
        {
          _id: 'doc1',
          type: 'Income Certificate',
          userId: { fullName: 'Ramesh Kumar', email: 'ramesh.k@example.com', mobile: '9876543210', state: 'Tamil Nadu' },
          cloudinaryUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=60',
          ocrStatus: 'Completed',
          confidenceScore: 94,
          status: 'Pending',
          docNumber: 'INC/TN/2026/8941',
          extractedData: { fullName: 'Ramesh Kumar', annualIncome: 140000, state: 'Tamil Nadu' },
          createdAt: new Date().toISOString()
        },
        {
          _id: 'doc2',
          type: 'Aadhaar',
          userId: { fullName: 'Priya Sharma', email: 'priya.s@example.com', mobile: '9845123456', state: 'Karnataka' },
          cloudinaryUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=60',
          ocrStatus: 'Completed',
          confidenceScore: 98,
          status: 'Verified',
          docNumber: 'XXXX-XXXX-9124',
          extractedData: { fullName: 'Priya Sharma', dob: '1992-08-14', gender: 'Female' },
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          _id: 'doc3',
          type: 'Community Certificate',
          userId: { fullName: 'Amit Patil', email: 'amit.patil@example.com', mobile: '9123456780', state: 'Maharashtra' },
          cloudinaryUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=60',
          ocrStatus: 'Completed',
          confidenceScore: 89,
          status: 'Pending',
          docNumber: 'CC/MH/2026/3411',
          extractedData: { fullName: 'Amit Patil', category: 'OBC', state: 'Maharashtra' },
          createdAt: new Date(Date.now() - 172800000).toISOString()
        }
      ]
    };
  }
  if (endpoint.includes('/applications')) {
    return {
      success: true,
      total: 3,
      page: 1,
      pages: 1,
      applications: [
        { 
          _id: 'app1', 
          userId: { fullName: 'Ramesh Kumar', email: 'ramesh.k@example.com', state: 'Tamil Nadu', category: 'OBC', mobile: '9876543210' }, 
          schemeId: { name: 'PM Kisan Samman Nidhi', department: 'Ministry of Agriculture', category: 'Agriculture' }, 
          status: 'Under Review', 
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          remarks: 'Land revenue documents verified. Awaiting banking confirmation.',
          timeline: [
            { status: 'Submitted', remarks: 'Application registered online.', timestamp: new Date(Date.now() - 172800000).toISOString() },
            { status: 'Under Review', remarks: 'Documents sent to verification queue.', timestamp: new Date().toISOString() }
          ]
        },
        { 
          _id: 'app2', 
          userId: { fullName: 'Priya Sharma', email: 'priya.s@example.com', state: 'Karnataka', category: 'General', mobile: '9845123456' }, 
          schemeId: { name: 'Post Matric Scholarship', department: 'Ministry of Social Justice', category: 'Education' }, 
          status: 'Approved', 
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date().toISOString(),
          remarks: 'Tuition reimbursement sanctioned for Academic Year 2026.',
          timeline: [
            { status: 'Submitted', remarks: 'Application registered.', timestamp: new Date(Date.now() - 86400000).toISOString() },
            { status: 'Approved', remarks: 'Eligibility confirmed by District Officer.', timestamp: new Date().toISOString() }
          ]
        },
        { 
          _id: 'app3', 
          userId: { fullName: 'Amit Patil', email: 'amit.patil@example.com', state: 'Maharashtra', category: 'OBC', mobile: '9123456780' }, 
          schemeId: { name: 'National Family Benefit Scheme', department: 'Ministry of Rural Development', category: 'Financial' }, 
          status: 'Submitted', 
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          updatedAt: new Date(Date.now() - 259200000).toISOString(),
          remarks: 'Awaiting primary inspection.',
          timeline: [
            { status: 'Submitted', remarks: 'Application received.', timestamp: new Date(Date.now() - 259200000).toISOString() }
          ]
        }
      ]
    };
  }
  if (endpoint.includes('/users')) {
    return {
      success: true,
      total: 4,
      page: 1,
      pages: 1,
      users: [
        { 
          _id: 'u1', 
          fullName: 'Ramesh Kumar', 
          email: 'ramesh.k@example.com', 
          mobile: '9876543210', 
          role: 'Citizen', 
          isActive: true, 
          profile: { state: 'Tamil Nadu', district: 'Madurai', category: 'OBC', annualIncome: 140000, occupation: 'Farmer', age: 38 },
          createdAt: new Date().toISOString() 
        },
        { 
          _id: 'u2', 
          fullName: 'Priya Sharma', 
          email: 'priya.s@example.com', 
          mobile: '9845123456', 
          role: 'Citizen', 
          isActive: true, 
          profile: { state: 'Karnataka', district: 'Bangalore Urban', category: 'General', annualIncome: 220000, occupation: 'Student', age: 21 },
          createdAt: new Date(Date.now() - 86400000).toISOString() 
        },
        { 
          _id: 'u3', 
          fullName: 'Amit Patil', 
          email: 'amit.patil@example.com', 
          mobile: '9123456780', 
          role: 'Citizen', 
          isActive: true, 
          profile: { state: 'Maharashtra', district: 'Pune', category: 'OBC', annualIncome: 180000, occupation: 'Small Business', age: 44 },
          createdAt: new Date(Date.now() - 172800000).toISOString() 
        },
        { 
          _id: 'u4', 
          fullName: 'Sunita Devi', 
          email: 'sunita.d@example.com', 
          mobile: '9345678901', 
          role: 'Citizen', 
          isActive: false, 
          profile: { state: 'Uttar Pradesh', district: 'Varanasi', category: 'SC', annualIncome: 90000, occupation: 'Artisan', age: 52 },
          createdAt: new Date(Date.now() - 345600000).toISOString() 
        }
      ]
    };
  }
  if (endpoint.includes('/notifications')) {
    return {
      success: true,
      notifications: [
        { _id: 'n1', title: 'System Security Audit Completed', message: 'Automated vulnerability scanning verified all scheme endpoints.', type: 'System', read: false, createdAt: new Date().toISOString() },
        { _id: 'n2', title: 'New Citizen Application Pending', message: 'A new application for PM Kisan Samman Nidhi requires verification.', type: 'ApplicationUpdate', read: false, createdAt: new Date(Date.now() - 1800000).toISOString() },
        { _id: 'n3', title: 'Scheme Rules Updated', message: 'Post Matric Scholarship income ceiling was calibrated to ₹2,50,000.', type: 'SchemeAlert', read: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
      ]
    };
  }
  if (endpoint.includes('/audit')) {
    return {
      success: true,
      total: 4,
      logs: [
        { _id: 'a1', adminName: 'Super Admin', action: 'CREATE_SCHEME', entityType: 'schemes', entityId: 'PM-KISAN', details: 'Added new national agricultural incentive scheme', createdAt: new Date().toISOString(), ipAddress: '127.0.0.1' },
        { _id: 'a2', adminName: 'Super Admin', action: 'UPDATE_SCHEME', entityType: 'schemes', entityId: 'PMS-EDU', details: 'Calibrated eligibility income threshold', createdAt: new Date(Date.now() - 3600000).toISOString(), ipAddress: '127.0.0.1' },
        { _id: 'a3', adminName: 'Nodal Officer', action: 'VERIFY_DOCUMENT', entityType: 'documents', entityId: 'DOC-9124', details: 'Aadhaar certificate verified for Priya Sharma', createdAt: new Date(Date.now() - 7200000).toISOString(), ipAddress: '127.0.0.1' },
        { _id: 'a4', adminName: 'Super Admin', action: 'ADMIN_LOGIN', entityType: 'auth', entityId: 'admin@govscheme.in', details: 'Successful 2FA session establishment', createdAt: new Date(Date.now() - 86400000).toISOString(), ipAddress: '127.0.0.1' },
      ]
    };
  }
  if (endpoint.includes('/reports')) {
    return {
      success: true,
      report: [
        { id: 1, date: new Date().toISOString().split('T')[0], metric: 'New Registrations', value: 124 },
        { id: 2, date: new Date().toISOString().split('T')[0], metric: 'Applications Submitted', value: 48 },
        { id: 3, date: new Date().toISOString().split('T')[0], metric: 'Applications Approved', value: 36 },
        { id: 4, date: new Date().toISOString().split('T')[0], metric: 'Applications Rejected', value: 3 },
        { id: 5, date: new Date().toISOString().split('T')[0], metric: 'New Schemes Created', value: 2 },
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
        ocrRequests: 4200, aiRequests: 18500, voiceRequests: 3200, storageUsed: '4.2 GB', apiHealth: 99.9,
      },
      charts: {
        userGrowth: [ 
          { name: 'May', users: 3100, applications: 1800 }, 
          { name: 'Jun', users: 3800, applications: 2200 }, 
          { name: 'Jul', users: 4400, applications: 2750 }, 
          { name: 'Aug', users: 5100, applications: 3400 }, 
          { name: 'Sep', users: 6200, applications: 4100 }, 
          { name: 'Oct', users: 7400, applications: 4900 } 
        ],
        applicationsByStatus: [ { name: 'Approved', value: 9200 }, { name: 'Under Review', value: 5100 }, { name: 'Rejected', value: 1100 } ],
        schemesByCategory: [ 
          { name: 'Agriculture', value: 42 }, 
          { name: 'Education', value: 38 }, 
          { name: 'Financial', value: 31 }, 
          { name: 'Housing', value: 24 },
          { name: 'Health', value: 19 }
        ],
        schemesByState: [ 
          { name: 'Central', value: 45 }, 
          { name: 'Maharashtra', value: 38 }, 
          { name: 'Tamil Nadu', value: 32 }, 
          { name: 'Karnataka', value: 28 },
          { name: 'Uttar Pradesh', value: 24 }
        ],
        dailyTraffic: [ 
          { name: 'Mon', requests: 1200, ocr: 400, ai: 800 }, 
          { name: 'Tue', requests: 1800, ocr: 600, ai: 1200 },
          { name: 'Wed', requests: 1650, ocr: 520, ai: 1130 },
          { name: 'Thu', requests: 2100, ocr: 710, ai: 1390 },
          { name: 'Fri', requests: 1950, ocr: 640, ai: 1310 }
        ]
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

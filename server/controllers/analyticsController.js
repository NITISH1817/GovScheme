import Scheme from '../models/Scheme.js';
import User from '../models/User.js';
import Application from '../models/Application.js';
import Document from '../models/Document.js';

// @desc    Get full dashboard analytics derived from real database records
// @route   GET /api/analytics/dashboard or GET /api/admin/analytics
// @access  Private (Admin)
export const getDashboardAnalytics = async (req, res) => {
  try {
    const { timeRange = '6M' } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    if (timeRange === '1M') {
      const d = new Date(); d.setMonth(now.getMonth() - 1); dateFilter = { createdAt: { $gte: d } };
    } else if (timeRange === '3M') {
      const d = new Date(); d.setMonth(now.getMonth() - 3); dateFilter = { createdAt: { $gte: d } };
    } else if (timeRange === '6M') {
      const d = new Date(); d.setMonth(now.getMonth() - 6); dateFilter = { createdAt: { $gte: d } };
    } else if (timeRange === '1Y') {
      const d = new Date(); d.setFullYear(now.getFullYear() - 1); dateFilter = { createdAt: { $gte: d } };
    }
    
    // Core KPI counts from actual collections
    const [totalSchemes, totalCitizens, totalApplications, totalDocuments] = await Promise.all([
      Scheme.countDocuments(dateFilter),
      User.countDocuments({ role: 'Citizen', ...dateFilter }),
      Application.countDocuments(dateFilter),
      Document.countDocuments(dateFilter)
    ]);

    const [publishedSchemes, draftSchemes, archivedSchemes] = await Promise.all([
      Scheme.countDocuments({ status: { $in: ['Active', 'Published'] }, ...dateFilter }),
      Scheme.countDocuments({ status: 'Draft', ...dateFilter }),
      Scheme.countDocuments({ status: 'Archived', ...dateFilter }),
    ]);

    const [approvedApps, pendingApps, rejectedApps] = await Promise.all([
      Application.countDocuments({ status: 'Approved', ...dateFilter }),
      Application.countDocuments({ status: { $in: ['Pending', 'Submitted', 'Under Review'] }, ...dateFilter }),
      Application.countDocuments({ status: 'Rejected', ...dateFilter }),
    ]);

    const [ocrRequests, verifiedDocuments] = await Promise.all([
      Document.countDocuments({ ocrStatus: { $in: ['COMPLETED', 'Completed'] }, ...dateFilter }),
      Document.countDocuments({ 
        $or: [
          { status: 'Verified' },
          { verificationStatus: { $in: ['CHECKS_PASSED', 'OFFICIALLY_VERIFIED'] } }
        ], 
        ...dateFilter 
      })
    ]);

    // Today's registrations
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const todayRegistrations = await User.countDocuments({
      role: 'Citizen',
      createdAt: { $gte: startOfDay },
    });

    // Active users (citizens who have submitted applications or uploaded documents)
    const activeAppUsers = await Application.distinct('userId');
    const activeDocUsers = await Document.distinct('userId');
    const uniqueActiveUserIds = new Set([
      ...activeAppUsers.map(id => id.toString()),
      ...activeDocUsers.map(id => id.toString())
    ]);
    const activeUsers = uniqueActiveUserIds.size;

    // Monthly user registrations & applications (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [monthlyUsers, monthlyApps] = await Promise.all([
      User.aggregate([
        { $match: { role: 'Citizen', createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            users: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      Application.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            applications: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ])
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Build chart-friendly array for the last 6 months using actual counts (0 when no records)
    const chartData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      const uEntry = monthlyUsers.find(e => e._id.month === m && e._id.year === y);
      const aEntry = monthlyApps.find(e => e._id.month === m && e._id.year === y);
      chartData.push({
        name: monthNames[m - 1],
        users: uEntry ? uEntry.users : 0,
        applications: aEntry ? aEntry.applications : 0,
      });
    }

    // Schemes by category
    const schemesByCategory = await Scheme.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$category', value: { $sum: 1 } } },
      { $project: { name: '$_id', value: 1, _id: 0 } },
      { $sort: { value: -1 } },
      { $limit: 8 },
    ]);

    // Applications by status
    const applicationsByStatus = await Application.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { name: '$_id', value: '$count', _id: 0 } },
    ]);

    // Schemes by state (top 8)
    const schemesByState = await Scheme.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$state', value: { $sum: 1 } } },
      { $project: { name: '$_id', value: 1, _id: 0 } },
      { $sort: { value: -1 } },
      { $limit: 8 },
    ]);

    // Daily activity counts for the last 7 days from actual database operations
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [dailyNewCitizens, dailyNewApplications, dailyNewDocs] = await Promise.all([
      User.aggregate([
        { $match: { role: 'Citizen', createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        }
      ]),
      Application.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        }
      ]),
      Document.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const dailyTraffic = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateKey = d.toISOString().split('T')[0];
      const citizenCount = dailyNewCitizens.find(item => item._id === dateKey)?.count || 0;
      const appCount = dailyNewApplications.find(item => item._id === dateKey)?.count || 0;
      const docCount = dailyNewDocs.find(item => item._id === dateKey)?.count || 0;
      return {
        name: d.toLocaleDateString('en', { weekday: 'short' }),
        date: dateKey,
        requests: citizenCount + appCount + docCount,
        ocr: docCount,
        applications: appCount,
        citizens: citizenCount
      };
    });

    res.json({
      success: true,
      metrics: {
        totalSchemes,
        publishedSchemes: publishedSchemes || totalSchemes,
        draftSchemes,
        archivedSchemes,
        totalCitizens,
        activeUsers,
        todayRegistrations,
        totalApplications,
        approvedApps,
        pendingApps,
        rejectedApps,
        totalDocuments,
        verifiedDocuments,
        ocrRequests,
        apiHealth: 100
      },
      charts: {
        userGrowth: chartData,
        schemesByCategory,
        applicationsByStatus,
        schemesByState,
        dailyTraffic
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

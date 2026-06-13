// pages/admin.js
import { useState, useEffect, useMemo, useCallback } from 'react';
import Head from 'next/head';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [storageType, setStorageType] = useState('');
  const [count, setCount] = useState(0);
  const [issuesCount, setIssuesCount] = useState(0);
  const [expandedRow, setExpandedRow] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [activeTab, setActiveTab] = useState('submissions'); // 'submissions', 'issues', or 'search'
  const [sortByIP, setSortByIP] = useState(true); // Enable IP sorting by default
  const [expandedIPs, setExpandedIPs] = useState({}); // Track which IP sections are expanded
  const [ipLocations, setIpLocations] = useState({}); // Cache for IP location data
  const [expandedTopCIE, setExpandedTopCIE] = useState(false); // Track if top CIE scorers section is expanded
  const [expandedTopSGPA, setExpandedTopSGPA] = useState(false); // Track if top SGPA section is expanded
  const [deleteIPConfirm, setDeleteIPConfirm] = useState(null); // Track which IP is being confirmed for deletion
  
  // User Search/Filter states
  const [searchMarks, setSearchMarks] = useState('');
  const [searchCourse, setSearchCourse] = useState('');
  const [searchCourse2, setSearchCourse2] = useState(''); // Second course for multi-subject search
  const [searchCourse3, setSearchCourse3] = useState(''); // Third course for multi-subject search
  const [searchMarksType, setSearchMarksType] = useState('cie'); // 'cie', 'see', or 'final'
  const [filterCycle, setFilterCycle] = useState(''); // '', 'C', or 'P'
  const [filterDeviceType, setFilterDeviceType] = useState(''); // '', 'Desktop', 'Mobile', 'Tablet'
  const [filterOS, setFilterOS] = useState(''); // '', 'Windows', 'macOS', 'Linux', 'Android', 'iOS'
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(false); // Track if search was performed

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`/api/admin-data?password=${encodeURIComponent(adminPassword)}`);
      const data = await response.json();

      if (response.ok) {
        setIsAuthenticated(true);
        setSubmissions(data.submissions || []);
        setCount(data.count || 0);
        setStorageType(data.storage || 'unknown');
        localStorage.setItem('admin-password', adminPassword);
        
        // Fetch issues
        fetchIssues(adminPassword);
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const fetchIssues = useCallback(async (password) => {
    try {
      const response = await fetch(`/api/get-issues?password=${encodeURIComponent(password)}`);
      const data = await response.json();
      
      if (response.ok) {
        setIssues(data.issues || []);
        setIssuesCount(data.count || 0);
      }
    } catch (err) {
      console.error('Failed to fetch issues:', err);
    }
  }, []);

  const loadData = useCallback(async () => {
    const savedPassword = localStorage.getItem('admin-password');
    if (!savedPassword) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin-data?password=${encodeURIComponent(savedPassword)}`);
      const data = await response.json();

      if (response.ok) {
        setIsAuthenticated(true);
        setSubmissions(data.submissions || []);
        setCount(data.count || 0);
        setStorageType(data.storage || 'unknown');
        setAdminPassword(savedPassword);
        
        // Fetch issues
        fetchIssues(savedPassword);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchIssues]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadData();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [loadData]);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdminPassword('');
    setSubmissions([]);
    localStorage.removeItem('admin-password');
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  const getDeviceDisplay = (deviceInfo) => {
    if (!deviceInfo) return 'Unknown';
    return `${deviceInfo.os} - ${deviceInfo.browser} (${deviceInfo.device})`;
  };

  const toggleRowExpansion = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  const toggleIPExpansion = (ip) => {
    setExpandedIPs(prev => ({
      ...prev,
      [ip]: !prev[ip]
    }));
  };

  const handleDeleteSubmission = async (index) => {
    if (deleteConfirm !== index) {
      setDeleteConfirm(index);
      return;
    }

    setLoading(true);
    try {
      const savedPassword = localStorage.getItem('admin-password');
      const response = await fetch(`/api/delete-submission?password=${encodeURIComponent(savedPassword)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ index }),
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh data after deletion
        await loadData();
        setDeleteConfirm(null);
        setExpandedRow(null);
      } else {
        alert(data.error || 'Failed to delete submission');
      }
    } catch (err) {
      alert('Failed to delete submission');
    } finally {
      setLoading(false);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const handleDeleteIPGroup = async (ipAddress) => {
    if (deleteIPConfirm !== ipAddress) {
      setDeleteIPConfirm(ipAddress);
      return;
    }

    setLoading(true);
    try {
      const savedPassword = localStorage.getItem('admin-password');
      const response = await fetch(`/api/delete-ip-group?password=${encodeURIComponent(savedPassword)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ipAddress }),
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh data after deletion
        await loadData();
        setDeleteIPConfirm(null);
        setExpandedIPs(prev => {
          const newState = { ...prev };
          delete newState[ipAddress];
          return newState;
        });
      } else {
        alert(data.error || 'Failed to delete IP group');
      }
    } catch (err) {
      alert('Failed to delete IP group');
    } finally {
      setLoading(false);
    }
  };

  const cancelDeleteIPGroup = () => {
    setDeleteIPConfirm(null);
  };

  const handleDeleteIssue = async (index) => {
    if (!confirm('Are you sure you want to delete this issue?')) {
      return;
    }

    setLoading(true);
    try {
      const savedPassword = localStorage.getItem('admin-password');
      const response = await fetch(`/api/delete-issue?password=${encodeURIComponent(savedPassword)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ index }),
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh issues after deletion
        await fetchIssues(savedPassword);
      } else {
        alert(data.error || 'Failed to delete issue');
      }
    } catch (err) {
      alert('Failed to delete issue');
    } finally {
      setLoading(false);
    }
  };

  // Group submissions by IP address
  const getGroupedSubmissions = () => {
    if (!sortByIP) {
      return { ungrouped: submissions };
    }

    const grouped = {};
    submissions.forEach((sub, index) => {
      const ip = sub.ipAddress || 'Unknown';
      if (!grouped[ip]) {
        grouped[ip] = [];
      }
      grouped[ip].push({ ...sub, originalIndex: index });
    });

    // Sort IPs by most recent submission time (newest first)
    const sortedGrouped = {};
    Object.keys(grouped)
      .sort((ipA, ipB) => {
        // Get the most recent submission for each IP
        const mostRecentA = grouped[ipA].reduce((latest, sub) => {
          const subTime = new Date(sub.timestamp).getTime();
          return subTime > latest ? subTime : latest;
        }, 0);
        
        const mostRecentB = grouped[ipB].reduce((latest, sub) => {
          const subTime = new Date(sub.timestamp).getTime();
          return subTime > latest ? subTime : latest;
        }, 0);
        
        // Sort descending (most recent first)
        return mostRecentB - mostRecentA;
      })
      .forEach(ip => {
        // Also sort submissions within each IP by most recent first
        const sortedSubs = grouped[ip].sort((a, b) => {
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });
        sortedGrouped[ip] = sortedSubs;
      });

    return sortedGrouped;
  };

  // Helper function to get cycle display name
  const getCycleName = (cycle) => {
    const cycleMap = {
      'C': 'C Cycle (Chemistry)',
      'P': 'P Cycle (Physics)'
    };
    return cycleMap[cycle] || 'Unknown Cycle';
  };

  // Helper function to get cycle badge color
  const getCycleBadgeColor = (cycle) => {
    const colorMap = {
      'C': 'bg-green-500/20 text-green-300',
      'P': 'bg-teal-500/20 text-teal-300'
    };
    return colorMap[cycle] || 'bg-gray-500/20 text-gray-300';
  };

  // Helper function to calculate CIE data for a submission
  const calculateCIEData = (submission) => {
    if (!submission?.data?.courses || submission.data.courses.length === 0) {
      return { totalCIE: 0, maxCIE: 0 };
    }
    
    let totalCIE = 0;
    let maxCIE = 0;
    
    submission.data.courses.forEach(course => {
      totalCIE += course.results?.totalCie || 0;
      maxCIE += course.courseDetails?.cieMax || 0;
    });
    
    return { totalCIE, maxCIE };
  };

  // Memoized helper function to get top scorers based on total CIE marks
  const getTopCIEScorers = useMemo(() => {
    return submissions
      .map((sub, index) => {
        const cieData = calculateCIEData(sub);
        return {
          ...sub,
          originalIndex: index,
          totalCIE: cieData.totalCIE,
          maxCIE: cieData.maxCIE
        };
      })
      .filter(sub => sub.totalCIE > 0)
      .sort((a, b) => b.totalCIE - a.totalCIE)  // Sort by raw total, highest first
      .slice(0, 10);
  }, [submissions]);

  // Memoized helper function to get top scorers based on SGPA
  const getTopSGPAScorers = useMemo(() => {
    return submissions
      .map((sub, index) => ({
        ...sub,
        originalIndex: index,
        sgpa: parseFloat(sub.data?.sgpa || 0)
      }))
      .filter(sub => sub.sgpa > 0)
      .sort((a, b) => b.sgpa - a.sgpa)
      .slice(0, 10);
  }, [submissions]);

  // Helper function to fetch IP location
  const fetchIPLocation = async (ip) => {
    // Skip localhost/private IPs
    if (ip === '::1' || ip === '127.0.0.1' || ip === 'Unknown' || 
        ip.startsWith('192.168.') || ip.startsWith('10.') || 
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)) {
      return 'Local';
    }

    // Check cache first
    if (ipLocations[ip]) {
      return ipLocations[ip];
    }

    try {
      // Using ip-api.com free API (no key required, 45 requests per minute)
      // Note: Using HTTP as HTTPS requires paid plan, but data is non-sensitive (just geolocation)
      const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city`);
      const data = await response.json();
      
      if (data.status === 'success') {
        const location = data.city && data.regionName 
          ? `${data.city}, ${data.regionName}, ${data.country}`
          : data.country || 'Unknown';
        
        // Cache the result
        setIpLocations(prev => ({ ...prev, [ip]: location }));
        return location;
      }
    } catch (error) {
      console.error('Failed to fetch IP location:', error);
    }
    
    return 'Unknown';
  };

  // Fetch locations for all IPs when submissions load
  useEffect(() => {
    if (submissions.length > 0) {
      const uniqueIPs = [...new Set(submissions.map(s => s.ipAddress).filter(Boolean))];
      uniqueIPs.forEach(ip => {
        // Only fetch if not already in cache
        if (!ipLocations[ip] && ip !== 'Unknown') {
          fetchIPLocation(ip);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submissions]); // Only re-run when submissions change, not ipLocations


  const CSV_HEADERS = ['Username', 'Cycle', 'Login Time', 'Submission Time', 'SGPA', 'Device', 'OS', 'Browser', 'IP Address'];

  const exportToCSV = () => {
    const csvRows = [];
    csvRows.push(CSV_HEADERS.join(','));

    submissions.forEach(sub => {
      const row = [
        sub.username || 'Guest',
        sub.cycle || 'N/A',
        sub.loginTime ? formatDate(sub.loginTime) : 'N/A',
        formatDate(sub.timestamp),
        sub.data?.sgpa || 'N/A',
        sub.deviceInfo?.device || 'N/A',
        sub.deviceInfo?.os || 'N/A',
        sub.deviceInfo?.browser || 'N/A',
        sub.ipAddress || 'N/A'
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-activity-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Get all unique courses from submissions
  const allCourses = useMemo(() => {
    const coursesSet = new Set();
    submissions.forEach(sub => {
      sub.data?.courses?.forEach(course => {
        if (course.courseDetails?.code && course.courseDetails?.title) {
          coursesSet.add(JSON.stringify({
            code: course.courseDetails.code,
            title: course.courseDetails.title
          }));
        }
      });
    });
    return Array.from(coursesSet).map(c => JSON.parse(c)).sort((a, b) => a.code.localeCompare(b.code));
  }, [submissions]);

  // Search and filter function
  const performSearch = () => {
    let results = [...submissions];

    // Filter by marks - support multiple subjects
    if (searchMarks) {
      const targetMarks = parseFloat(searchMarks);
      if (!isNaN(targetMarks)) {
        // Collect all selected courses
        const selectedCourses = [searchCourse, searchCourse2, searchCourse3].filter(c => c);
        
        if (selectedCourses.length > 0) {
          // User must have the marks in ANY of the selected subjects
          results = results.filter(sub => {
            return selectedCourses.some(courseCode => {
              const course = sub.data?.courses?.find(c => c.courseDetails?.code === courseCode);
              if (!course) return false;

              if (searchMarksType === 'cie') {
                return course.results?.totalCie === targetMarks;
              } else if (searchMarksType === 'see') {
                return course.results?.see === targetMarks;
              } else if (searchMarksType === 'final') {
                return Math.abs((course.results?.finalScore || 0) - targetMarks) < 0.01;
              }
              return false;
            });
          });
        }
      }
    } else if (searchCourse || searchCourse2 || searchCourse3) {
      // If no marks specified but courses are selected, filter by those who have taken these courses
      const selectedCourses = [searchCourse, searchCourse2, searchCourse3].filter(c => c);
      if (selectedCourses.length > 0) {
        results = results.filter(sub => {
          return selectedCourses.some(courseCode => {
            return sub.data?.courses?.some(c => c.courseDetails?.code === courseCode);
          });
        });
      }
    }

    // Filter by cycle
    if (filterCycle) {
      results = results.filter(sub => sub.cycle === filterCycle);
    }

    // Filter by device type
    if (filterDeviceType) {
      results = results.filter(sub => sub.deviceInfo?.device === filterDeviceType);
    }

    // Filter by OS
    if (filterOS) {
      results = results.filter(sub => sub.deviceInfo?.os === filterOS);
    }

    // Filter by date range
    if (filterDateFrom) {
      const fromDate = new Date(filterDateFrom);
      results = results.filter(sub => new Date(sub.timestamp) >= fromDate);
    }
    if (filterDateTo) {
      const toDate = new Date(filterDateTo);
      toDate.setHours(23, 59, 59, 999); // Include the entire day
      results = results.filter(sub => new Date(sub.timestamp) <= toDate);
    }

    setSearchResults(results);
    setSearchPerformed(true); // Mark that search has been performed
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchMarks('');
    setSearchCourse('');
    setSearchCourse2('');
    setSearchCourse3('');
    setSearchMarksType('cie');
    setFilterCycle('');
    setFilterDeviceType('');
    setFilterOS('');
    setFilterDateFrom('');
    setFilterDateTo('');
    setSearchResults([]);
    setSearchPerformed(false); // Reset search performed flag
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-pink-900 to-gray-900 flex items-center justify-center p-4">
        <Head>
          <title>Admin Login - RVCE Grade Calculator</title>
        </Head>

        <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-2xl border border-gray-700 p-8">
          <h1 className="text-3xl font-bold text-white mb-6 text-center">Admin Access</h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-6">
              <label htmlFor="adminPassword" className="block text-gray-300 text-sm font-medium mb-2">
                Admin Password
              </label>
              <input
                type="password"
                id="adminPassword"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-white"
                placeholder="Enter admin password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-gradient-to-r from-pink-500 to-teal-500 hover:from-pink-600 hover:to-teal-600 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-pink-900 to-gray-900 text-white p-4 sm:p-8">
      <Head>
        <title>Admin Dashboard - RVCE Grade Calculator</title>
      </Head>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-gray-400">
              Submissions: {count} | Issues: {issuesCount} | Storage: {storageType}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadData}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg font-medium transition-colors"
            >
              Refresh
            </button>
            {activeTab === 'submissions' && (
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
              >
                Export CSV
              </button>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'submissions'
                ? 'text-pink-400 border-b-2 border-pink-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Submissions ({count})
          </button>
          <button
            onClick={() => setActiveTab('issues')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'issues'
                ? 'text-pink-400 border-b-2 border-pink-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Issues ({issuesCount})
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'search'
                ? 'text-pink-400 border-b-2 border-pink-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            🔍 User Search
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
            <p className="mt-4 text-gray-400">Loading data...</p>
          </div>
        )}

        {/* Submissions Tab */}
        {!loading && activeTab === 'submissions' && (
          <>
            {/* Top Scorers Sections */}
            {submissions.length > 0 && (
              <div className="mb-6 space-y-4">
                {/* Top CIE Scorers */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                  <button
                    onClick={() => setExpandedTopCIE(!expandedTopCIE)}
                    className="w-full bg-gradient-to-r from-green-900/40 to-gray-900 px-4 py-3 border-b border-gray-700 hover:from-green-900/60 hover:to-gray-900 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <svg 
                          className={`w-5 h-5 text-green-400 transform transition-transform duration-200 ${expandedTopCIE ? 'rotate-90' : ''}`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        🏆 Top Scorers - Total CIE Marks
                        <span className="ml-2 px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
                          Top {Math.min(10, getTopCIEScorers.length)}
                        </span>
                      </h3>
                      <span className="text-sm text-gray-400">
                        {expandedTopCIE ? 'Click to collapse' : 'Click to expand'}
                      </span>
                    </div>
                  </button>
                  {expandedTopCIE && (
                    <div className="p-4">
                      <div className="space-y-3">
                        {getTopCIEScorers.map((scorer, idx) => {
                          const location = ipLocations[scorer.ipAddress] || 'Loading...';
                          return (
                            <div key={scorer.originalIndex} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                                    idx === 0 ? 'bg-yellow-500/20 text-yellow-300' :
                                    idx === 1 ? 'bg-gray-400/20 text-gray-300' :
                                    idx === 2 ? 'bg-orange-600/20 text-orange-400' :
                                    'bg-pink-500/20 text-pink-300'
                                  }`}>
                                    {idx + 1}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-white font-semibold">{scorer.username || 'Guest'}</span>
                                      {scorer.cycle && (
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getCycleBadgeColor(scorer.cycle)}`}>
                                          {scorer.cycle}
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                      {scorer.ipAddress && (
                                        <span className="font-mono">
                                          {scorer.ipAddress}
                                          {location !== 'Loading...' && location !== 'Unknown' && (
                                            <span className="text-gray-500"> ({location})</span>
                                          )}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-green-400">{scorer.totalCIE}</div>
                                  <div className="text-xs text-gray-400">out of 750</div>
                                </div>
                              </div>
                              {/* Course-wise CIE breakdown */}
                              <details className="mt-2">
                                <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-300 transition-colors">
                                  View detailed scores ({scorer.data?.courses?.length || 0} courses)
                                </summary>
                                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {scorer.data?.courses?.map((course, courseIdx) => (
                                    <div key={courseIdx} className="bg-gray-800/50 rounded p-2 text-sm">
                                      <div className="text-gray-300 font-medium text-xs mb-1">{course.courseDetails?.code}</div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-gray-400 text-xs">{course.courseDetails?.title}</span>
                                        <span className="text-green-300 font-semibold">{course.results?.totalCie || 0}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </details>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Top SGPA Scorers */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                  <button
                    onClick={() => setExpandedTopSGPA(!expandedTopSGPA)}
                    className="w-full bg-gradient-to-r from-pink-900/40 to-gray-900 px-4 py-3 border-b border-gray-700 hover:from-pink-900/60 hover:to-gray-900 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <svg 
                          className={`w-5 h-5 text-pink-400 transform transition-transform duration-200 ${expandedTopSGPA ? 'rotate-90' : ''}`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        🏆 Top Scorers - SGPA
                        <span className="ml-2 px-2 py-1 bg-pink-500/20 text-pink-300 rounded-full text-sm">
                          Top {Math.min(10, getTopSGPAScorers.length)}
                        </span>
                      </h3>
                      <span className="text-sm text-gray-400">
                        {expandedTopSGPA ? 'Click to collapse' : 'Click to expand'}
                      </span>
                    </div>
                  </button>
                  {expandedTopSGPA && (
                    <div className="p-4">
                      <div className="space-y-3">
                        {getTopSGPAScorers.map((scorer, idx) => {
                          const location = ipLocations[scorer.ipAddress] || 'Loading...';
                          return (
                            <div key={scorer.originalIndex} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                                    idx === 0 ? 'bg-yellow-500/20 text-yellow-300' :
                                    idx === 1 ? 'bg-gray-400/20 text-gray-300' :
                                    idx === 2 ? 'bg-orange-600/20 text-orange-400' :
                                    'bg-pink-500/20 text-pink-300'
                                  }`}>
                                    {idx + 1}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-white font-semibold">{scorer.username || 'Guest'}</span>
                                      {scorer.cycle && (
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getCycleBadgeColor(scorer.cycle)}`}>
                                          {scorer.cycle}
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                      {scorer.ipAddress && (
                                        <span className="font-mono">
                                          {scorer.ipAddress}
                                          {location !== 'Loading...' && location !== 'Unknown' && (
                                            <span className="text-gray-500"> ({location})</span>
                                          )}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-pink-400">{scorer.sgpa}</div>
                                  <div className="text-xs text-gray-400">SGPA</div>
                                </div>
                              </div>
                              {/* Course-wise grade breakdown */}
                              <details className="mt-2">
                                <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-300 transition-colors">
                                  View detailed scores ({scorer.data?.courses?.length || 0} courses)
                                </summary>
                                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {scorer.data?.courses?.map((course, courseIdx) => (
                                    <div key={courseIdx} className="bg-gray-800/50 rounded p-3 text-sm border border-gray-700">
                                      <div className="text-gray-300 font-medium text-xs mb-2">{course.courseDetails?.code}</div>
                                      <div className="text-gray-400 text-xs mb-2">{course.courseDetails?.title}</div>
                                      
                                      {/* Marks breakdown */}
                                      <div className="space-y-1 mb-2">
                                        {course.results?.totalCie !== undefined && (
                                          <div className="flex justify-between text-xs">
                                            <span className="text-gray-400">CIE Marks:</span>
                                            <span className="text-green-300 font-semibold">
                                              {course.results.totalCie}/{course.courseDetails?.cieMax || 'N/A'}
                                            </span>
                                          </div>
                                        )}
                                        {course.results?.see !== undefined && (
                                          <div className="flex justify-between text-xs">
                                            <span className="text-gray-400">SEE Marks:</span>
                                            <span className="text-teal-300 font-semibold">
                                              {course.results.see}/{course.courseDetails?.seeMax || 'N/A'}
                                            </span>
                                          </div>
                                        )}
                                        {course.results?.finalScore !== undefined && (
                                          <div className="flex justify-between text-xs">
                                            <span className="text-gray-400">Final Score:</span>
                                            <span className="text-white font-semibold">
                                              {course.results.finalScore.toFixed(2)}%
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                      
                                      {/* Grade and points */}
                                      <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                          course.results?.grade === 'O' ? 'bg-green-500/20 text-green-300' :
                                          course.results?.grade === 'A+' ? 'bg-teal-500/20 text-teal-300' :
                                          course.results?.grade === 'A' ? 'bg-pink-500/20 text-pink-300' :
                                          course.results?.grade === 'F' ? 'bg-red-500/20 text-red-300' :
                                          'bg-yellow-500/20 text-yellow-300'
                                        }`}>
                                          {course.results?.grade || 'N/A'}
                                        </span>
                                        <span className="text-pink-300 font-semibold">{course.results?.points || 0} pts</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </details>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sort Toggle */}
            <div className="mb-4 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sortByIP}
                  onChange={(e) => setSortByIP(e.target.checked)}
                  className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-pink-500 focus:ring-2 focus:ring-pink-500"
                />
                <span className="text-gray-300 font-medium">Group by IP Address</span>
              </label>
              {sortByIP && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const ips = Object.keys(getGroupedSubmissions());
                      const newExpandedState = {};
                      ips.forEach(ip => {
                        newExpandedState[ip] = true;
                      });
                      setExpandedIPs(newExpandedState);
                    }}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded transition-colors"
                  >
                    Expand All
                  </button>
                  <button
                    onClick={() => {
                      const ips = Object.keys(getGroupedSubmissions());
                      const newExpandedState = {};
                      ips.forEach(ip => {
                        newExpandedState[ip] = false;
                      });
                      setExpandedIPs(newExpandedState);
                    }}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded transition-colors"
                  >
                    Collapse All
                  </button>
                </div>
              )}
            </div>

            {submissions.length === 0 ? (
              <div className="text-center py-12 bg-gray-800 rounded-xl">
                <p className="text-gray-400 text-lg">No submissions yet</p>
              </div>
            ) : sortByIP ? (
              // Grouped by IP view
              <div className="space-y-6">
                {Object.entries(getGroupedSubmissions()).map(([ip, ipSubmissions]) => {
                  const isExpanded = expandedIPs[ip] === true; // Default to collapsed
                  const cCycleCount = ipSubmissions.filter(s => s.cycle === 'C').length;
                  const pCycleCount = ipSubmissions.filter(s => s.cycle === 'P').length;
                  const location = ipLocations[ip] || 'Loading...';
                  
                  return (
                    <div key={ip} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                      <div className="w-full bg-gray-900 px-4 py-3 border-b border-gray-700">
                        <div className="flex items-center justify-between gap-4">
                          <button
                            onClick={() => toggleIPExpansion(ip)}
                            className="flex-1 hover:opacity-80 transition-opacity cursor-pointer text-left"
                          >
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2 flex-wrap">
                              <svg 
                                className={`w-5 h-5 text-pink-400 transform transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                              <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                              </svg>
                              IP: <span className="font-mono text-pink-300">{ip}</span>
                              {location !== 'Loading...' && location !== 'Unknown' && (
                                <span className="text-sm text-gray-400 font-normal">
                                  📍 {location}
                                </span>
                              )}
                              <span className="ml-2 px-2 py-1 bg-pink-500/20 text-pink-300 rounded-full text-sm">
                                {ipSubmissions.length} submission{ipSubmissions.length !== 1 ? 's' : ''}
                              </span>
                              {cCycleCount > 0 && (
                                <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-xs">
                                  C: {cCycleCount}
                                </span>
                              )}
                              {pCycleCount > 0 && (
                                <span className="px-2 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs">
                                  P: {pCycleCount}
                                </span>
                              )}
                            </h3>
                          </button>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {deleteIPConfirm === ip ? (
                              <>
                                <button
                                  onClick={() => handleDeleteIPGroup(ip)}
                                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-colors"
                                  title="Confirm deletion"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={cancelDeleteIPGroup}
                                  className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded transition-colors"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleDeleteIPGroup(ip)}
                                className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 text-sm font-medium rounded transition-colors border border-red-600/30"
                                title={`Delete all ${ipSubmissions.length} submission(s) from this IP`}
                              >
                                Delete IP Group
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      {isExpanded && renderSubmissionsTable(ipSubmissions)}
                    </div>
                  );
                })}
              </div>
            ) : (
              // Regular view
              <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                {renderSubmissionsTable(submissions.map((sub, idx) => ({ ...sub, originalIndex: idx })))}
              </div>
            )}
          </>
        )}

        {/* Issues Tab */}
        {!loading && activeTab === 'issues' && (
          <>
            {issues.length === 0 ? (
              <div className="text-center py-12 bg-gray-800 rounded-xl">
                <p className="text-gray-400 text-lg">No issues reported yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {issues.map((issue, index) => (
                  <div key={issue.id || index} className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-2">{issue.title}</h3>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-400 mb-3">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formatDate(issue.timestamp)}
                          </span>
                          {issue.email && (
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              {issue.email}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            Page: {issue.page}
                          </span>
                          {issue.ipAddress && (
                            <span className="flex items-center gap-1 font-mono">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                              </svg>
                              {issue.ipAddress}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteIssue(index)}
                        className="ml-4 px-3 py-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 text-sm rounded transition-colors border border-red-600/30"
                        title="Delete issue"
                      >
                        Delete
                      </button>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-4">
                      <p className="text-gray-300 whitespace-pre-wrap">{issue.description}</p>
                    </div>
                    {issue.userAgent && (
                      <div className="mt-3 pt-3 border-t border-gray-700">
                        <p className="text-xs text-gray-500 mb-1">User Agent:</p>
                        <p className="text-xs text-gray-400 font-mono break-all">{issue.userAgent}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* User Search Tab */}
        {!loading && activeTab === 'search' && (
          <div className="space-y-6">
            {/* Search Filters Card */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Advanced User Search & Filters
              </h2>

              <div className="space-y-6">
                {/* Marks Search Section */}
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="text-green-400">📊</span>
                    Search by Marks (Multi-Subject Support)
                  </h3>
                  <div className="space-y-4">
                    {/* First Row: Course selections */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Subject 1
                        </label>
                        <select
                          value={searchCourse}
                          onChange={(e) => setSearchCourse(e.target.value)}
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                        >
                          <option value="">-- Select subject 1 --</option>
                          {allCourses.map(course => (
                            <option key={course.code} value={course.code}>
                              {course.code} - {course.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Subject 2 (Optional)
                        </label>
                        <select
                          value={searchCourse2}
                          onChange={(e) => setSearchCourse2(e.target.value)}
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                        >
                          <option value="">-- Select subject 2 --</option>
                          {allCourses.map(course => (
                            <option key={course.code} value={course.code}>
                              {course.code} - {course.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Subject 3 (Optional)
                        </label>
                        <select
                          value={searchCourse3}
                          onChange={(e) => setSearchCourse3(e.target.value)}
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                        >
                          <option value="">-- Select subject 3 --</option>
                          {allCourses.map(course => (
                            <option key={course.code} value={course.code}>
                              {course.code} - {course.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {/* Second Row: Marks Type and Value */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Marks Type
                        </label>
                        <select
                          value={searchMarksType}
                          onChange={(e) => setSearchMarksType(e.target.value)}
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                        >
                          <option value="cie">CIE Marks</option>
                          <option value="see">SEE Marks</option>
                          <option value="final">Final Score</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Marks Value (Optional)
                        </label>
                        <input
                          type="number"
                          value={searchMarks}
                          onChange={(e) => setSearchMarks(e.target.value)}
                          placeholder="Enter marks (e.g., 92)"
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 italic">
                      💡 Tip: Select 1-3 subjects to search. If marks value is provided, users with matching marks in ANY of the selected subjects will be shown.
                    </p>
                  </div>
                </div>

                {/* Additional Filters Section */}
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="text-teal-400">🎯</span>
                    Additional Filters
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Cycle Type
                      </label>
                      <select
                        value={filterCycle}
                        onChange={(e) => setFilterCycle(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                      >
                        <option value="">All Cycles</option>
                        <option value="C">C Cycle (Chemistry)</option>
                        <option value="P">P Cycle (Physics)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Device Type
                      </label>
                      <select
                        value={filterDeviceType}
                        onChange={(e) => setFilterDeviceType(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                      >
                        <option value="">All Devices</option>
                        <option value="Desktop">Desktop</option>
                        <option value="Mobile">Mobile</option>
                        <option value="Tablet">Tablet</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Operating System
                      </label>
                      <select
                        value={filterOS}
                        onChange={(e) => setFilterOS(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                      >
                        <option value="">All OS</option>
                        <option value="Windows">Windows</option>
                        <option value="macOS">macOS</option>
                        <option value="Linux">Linux</option>
                        <option value="Android">Android</option>
                        <option value="iOS">iOS</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Date Range Filter */}
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="text-yellow-400">📅</span>
                    Date Range
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        From Date
                      </label>
                      <input
                        type="date"
                        value={filterDateFrom}
                        onChange={(e) => setFilterDateFrom(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        To Date
                      </label>
                      <input
                        type="date"
                        value={filterDateTo}
                        onChange={(e) => setFilterDateTo(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-end">
                  <button
                    onClick={clearFilters}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Clear All Filters
                  </button>
                  <button
                    onClick={performSearch}
                    className="px-6 py-3 bg-gradient-to-r from-pink-500 to-teal-500 hover:from-pink-600 hover:to-teal-600 text-white font-semibold rounded-lg transition-all duration-200"
                  >
                    🔍 Search Users
                  </button>
                </div>
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-green-900/40 to-gray-900 px-6 py-4 border-b border-gray-700">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    Search Results
                    <span className="ml-2 px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
                      {searchResults.length} user{searchResults.length !== 1 ? 's' : ''} found
                    </span>
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-900">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">#</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Username</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">IP Address</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Cycle</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">SGPA</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Device</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Date</th>
                        {searchCourse && (
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">
                            {searchCourse} - {searchMarksType.toUpperCase()}
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {searchResults.map((result, idx) => {
                        const location = ipLocations[result.ipAddress] || 'Loading...';
                        const course = searchCourse ? result.data?.courses?.find(c => c.courseDetails?.code === searchCourse) : null;
                        let marksValue = 'N/A';
                        if (course) {
                          if (searchMarksType === 'cie') {
                            marksValue = course.results?.totalCie || 'N/A';
                          } else if (searchMarksType === 'see') {
                            marksValue = course.results?.see || 'N/A';
                          } else if (searchMarksType === 'final') {
                            marksValue = course.results?.finalScore?.toFixed(2) || 'N/A';
                          }
                        }
                        
                        return (
                          <tr key={idx} className="hover:bg-gray-700/50 transition-colors">
                            <td className="px-4 py-3 text-gray-300">{idx + 1}</td>
                            <td className="px-4 py-3">
                              <div className="text-white font-medium">{result.username || 'Guest'}</div>
                              {result.loginTime && (
                                <div className="text-xs text-gray-400">
                                  Login: {formatDate(result.loginTime)}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-mono text-pink-300 text-sm">{result.ipAddress || 'Unknown'}</div>
                              {location !== 'Loading...' && location !== 'Unknown' && (
                                <div className="text-xs text-gray-400">{location}</div>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {result.cycle ? (
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getCycleBadgeColor(result.cycle)}`}>
                                  {result.cycle}
                                </span>
                              ) : (
                                <span className="text-gray-500">N/A</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-white font-semibold">{result.data?.sgpa || 'N/A'}</td>
                            <td className="px-4 py-3">
                              <div className="text-gray-300 text-sm">{result.deviceInfo?.device || 'Unknown'}</div>
                              <div className="text-xs text-gray-400">{result.deviceInfo?.os || 'Unknown'}</div>
                            </td>
                            <td className="px-4 py-3 text-gray-300 text-sm">{formatDate(result.timestamp)}</td>
                            {searchCourse && (
                              <td className="px-4 py-3">
                                <span className="text-green-400 font-semibold">{marksValue}</span>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* No Results Message */}
            {searchPerformed && searchResults.length === 0 && (
              <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700">
                <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-400 text-lg">No users found matching your search criteria</p>
                <p className="text-gray-500 text-sm mt-2">Try adjusting your filters or search parameters</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Helper function to render submissions table
  function renderSubmissionsTable(submissionsToRender) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Details
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Username
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Cycle
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                SGPA
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Login Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Submission Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Device Info
              </th>
              {!sortByIP && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  IP Address
                </th>
              )}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {submissionsToRender.map((submission, idx) => {
              const index = submission.originalIndex !== undefined ? submission.originalIndex : idx;
              return (
                <>
                  <tr key={index} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={() => toggleRowExpansion(index)}
                        className="text-pink-400 hover:text-pink-300 focus:outline-none"
                        title="View course details"
                      >
                        <svg
                          className={`w-5 h-5 transform transition-transform ${expandedRow === index ? 'rotate-90' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {submission.username ? (
                          <>
                            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                            </svg>
                            <span className="text-white font-medium">{submission.username}</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                            </svg>
                            <span className="text-gray-500">Guest</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {submission.cycle ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getCycleBadgeColor(submission.cycle)}`}>
                          {getCycleName(submission.cycle).split(' (')[0]} {/* Display short form like "C Cycle" or "P Cycle" */}
                        </span>
                      ) : (
                        <span className="text-gray-500 text-xs">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-1 bg-pink-500/20 text-pink-300 rounded-full text-sm font-semibold">
                        {submission.data?.sgpa || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                      {submission.loginTime ? formatDate(submission.loginTime) : 'N/A'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                      {formatDate(submission.timestamp)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {getDeviceDisplay(submission.deviceInfo)}
                    </td>
                    {!sortByIP && (
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400 font-mono">
                        {submission.ipAddress ? (
                          <>
                            {submission.ipAddress}
                            {ipLocations[submission.ipAddress] && 
                             ipLocations[submission.ipAddress] !== 'Loading...' && 
                             ipLocations[submission.ipAddress] !== 'Unknown' && (
                              <span className="text-gray-500 ml-1">
                                ({ipLocations[submission.ipAddress]})
                              </span>
                            )}
                          </>
                        ) : (
                          'N/A'
                        )}
                      </td>
                    )}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {deleteConfirm === index ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDeleteSubmission(index)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={cancelDelete}
                            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleDeleteSubmission(index)}
                          className="px-3 py-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 text-xs rounded transition-colors border border-red-600/30"
                          title="Delete submission"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                  {expandedRow === index && (
                    <tr key={`${index}-detail`}>
                      <td colSpan={sortByIP ? "8" : "9"} className="px-4 py-4 bg-gray-900/50">
                        <div className="space-y-4">
                          {/* Complete Submission Information */}
                          <div className="bg-gray-800/70 rounded-lg p-4 border border-gray-700">
                            <h4 className="text-lg font-semibold text-white mb-3">Complete Submission Data</h4>
                            
                            {/* User Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                              <div className="bg-gray-900/50 rounded p-3">
                                <p className="text-xs text-gray-400 mb-1">Username</p>
                                <p className="text-sm text-white font-semibold">{submission.username || 'Guest'}</p>
                              </div>
                              <div className="bg-gray-900/50 rounded p-3">
                                <p className="text-xs text-gray-400 mb-1">Cycle</p>
                                <p className="text-sm text-white font-semibold">
                                  {submission.cycle ? getCycleName(submission.cycle) : 'N/A'}
                                </p>
                              </div>
                              <div className="bg-gray-900/50 rounded p-3">
                                <p className="text-xs text-gray-400 mb-1">Login Time</p>
                                <p className="text-sm text-white font-semibold">{submission.loginTime ? formatDate(submission.loginTime) : 'N/A'}</p>
                              </div>
                              <div className="bg-gray-900/50 rounded p-3">
                                <p className="text-xs text-gray-400 mb-1">Submission Time</p>
                                <p className="text-sm text-white font-semibold">{formatDate(submission.timestamp)}</p>
                              </div>
                              <div className="bg-gray-900/50 rounded p-3">
                                <p className="text-xs text-gray-400 mb-1">IP Address</p>
                                <p className="text-sm text-white font-semibold font-mono">{submission.ipAddress || 'N/A'}</p>
                              </div>
                              <div className="bg-gray-900/50 rounded p-3">
                                <p className="text-xs text-gray-400 mb-1">Operating System</p>
                                <p className="text-sm text-white font-semibold">{submission.deviceInfo?.os || 'Unknown'}</p>
                              </div>
                              <div className="bg-gray-900/50 rounded p-3">
                                <p className="text-xs text-gray-400 mb-1">Browser</p>
                                <p className="text-sm text-white font-semibold">{submission.deviceInfo?.browser || 'Unknown'}</p>
                              </div>
                              <div className="bg-gray-900/50 rounded p-3">
                                <p className="text-xs text-gray-400 mb-1">Device Type</p>
                                <p className="text-sm text-white font-semibold">{submission.deviceInfo?.device || 'Unknown'}</p>
                              </div>
                              <div className="bg-gray-900/50 rounded p-3">
                                <p className="text-xs text-gray-400 mb-1">SGPA</p>
                                <p className="text-sm text-white font-semibold text-pink-400 text-lg">{submission.data?.sgpa || 'N/A'}</p>
                              </div>
                              <div className="bg-gray-900/50 rounded p-3">
                                <p className="text-xs text-gray-400 mb-1">Total Courses</p>
                                <p className="text-sm text-white font-semibold">{submission.data?.courses?.length || 0}</p>
                              </div>
                            </div>

                            {/* User Agent String */}
                            {submission.userAgent && (
                              <div className="bg-gray-900/50 rounded p-3 mt-3">
                                <p className="text-xs text-gray-400 mb-1">User Agent</p>
                                <p className="text-xs text-gray-300 font-mono break-all">{submission.userAgent}</p>
                              </div>
                            )}
                          </div>

                          {/* Course Details */}
                          {submission.data?.courses && submission.data.courses.length > 0 && (
                            <div>
                              <h4 className="text-lg font-semibold text-white mb-3">Course Details ({submission.data.courses.length} courses)</h4>
                              <div className="grid gap-3">
                            {submission.data.courses.map((course, courseIdx) => {
                              if (!course.courseDetails) return null;
                              const hasCIE = course.results?.totalCie > 0;
                              const hasSEE = course.results?.see !== undefined && course.results?.see !== null;
                              
                              return (
                                <div key={courseIdx} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                                  <div className="flex justify-between items-start mb-3">
                                    <div>
                                      <h5 className="text-white font-medium">
                                        {course.courseDetails.code} - {course.courseDetails.title}
                                      </h5>
                                      <p className="text-sm text-gray-400">
                                        Credits: {course.courseDetails.credits} | Type: {course.courseDetails.type}
                                      </p>
                                    </div>
                                    {course.results?.grade && (
                                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                        course.results.grade === 'O' ? 'bg-green-500/20 text-green-300' :
                                        course.results.grade === 'A+' ? 'bg-teal-500/20 text-teal-300' :
                                        course.results.grade === 'A' ? 'bg-pink-500/20 text-pink-300' :
                                        course.results.grade === 'F' ? 'bg-red-500/20 text-red-300' :
                                        'bg-yellow-500/20 text-yellow-300'
                                      }`}>
                                        {course.results.grade} ({course.results.points} pts)
                                      </span>
                                    )}
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                    {hasCIE && (
                                      <div className="bg-gray-900/50 rounded p-2">
                                        <p className="text-gray-400 text-xs mb-1">CIE Marks</p>
                                        <p className="text-white font-semibold">
                                          {course.results.totalCie}/{course.courseDetails.cieMax}
                                          <span className="text-gray-400 text-xs ml-1">
                                            ({((course.results.totalCie / course.courseDetails.cieMax) * 100).toFixed(1)}%)
                                          </span>
                                        </p>
                                      </div>
                                    )}
                                    {hasSEE && (
                                      <div className="bg-gray-900/50 rounded p-2">
                                        <p className="text-gray-400 text-xs mb-1">SEE Marks</p>
                                        <p className="text-white font-semibold">
                                          {course.results.see}/{course.courseDetails.seeMax}
                                          <span className="text-gray-400 text-xs ml-1">
                                            ({((course.results.see / course.courseDetails.seeMax) * 100).toFixed(1)}%)
                                          </span>
                                        </p>
                                      </div>
                                    )}
                                    {course.results?.finalScore !== undefined && (
                                      <div className="bg-gray-900/50 rounded p-2">
                                        <p className="text-gray-400 text-xs mb-1">Final Score</p>
                                        <p className="text-white font-semibold">{course.results.finalScore.toFixed(2)}/100</p>
                                      </div>
                                    )}
                                    {course.results?.isPass !== undefined && (
                                      <div className="bg-gray-900/50 rounded p-2">
                                        <p className="text-gray-400 text-xs mb-1">Status</p>
                                        <p className={`font-semibold ${course.results.isPass ? 'text-green-400' : 'text-red-400'}`}>
                                          {course.results.isPass ? 'Pass' : 'Fail'}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                  {/* CIE Components Breakdown */}
                                  {course.cieMarks && Object.keys(course.cieMarks).length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-gray-700">
                                      <p className="text-xs text-gray-400 mb-2 font-semibold">CIE Components (Detailed Breakdown):</p>
                                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                        {Object.entries(course.cieMarks).map(([key, value]) => {
                                          // Format the key to be more readable
                                          const formattedKey = key
                                            .replace(/([A-Z])/g, ' $1')
                                            .replace(/^./, str => str.toUpperCase())
                                            .trim();
                                          
                                          return (
                                            <div key={key} className="bg-gray-900/70 px-3 py-2 rounded border border-gray-700">
                                              <p className="text-xs text-gray-400 mb-1">{formattedKey}</p>
                                              <p className="text-sm text-white font-semibold">{value || 'N/A'}</p>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* SEE Marks Breakdown */}
                                  {course.seeMarks && Object.keys(course.seeMarks).length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-gray-700">
                                      <p className="text-xs text-gray-400 mb-2 font-semibold">SEE Marks (Detailed Breakdown):</p>
                                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                        {Object.entries(course.seeMarks).map(([key, value]) => {
                                          // Format the key to be more readable
                                          const formattedKey = key
                                            .replace(/([A-Z])/g, ' $1')
                                            .replace(/^./, str => str.toUpperCase())
                                            .trim();
                                          
                                          return (
                                            <div key={key} className="bg-gray-900/70 px-3 py-2 rounded border border-gray-700">
                                              <p className="text-xs text-gray-400 mb-1">{formattedKey}</p>
                                              <p className="text-sm text-white font-semibold">{value || 'N/A'}</p>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                            </div>
                          </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
}

import {
    AlertCircle,
    ArrowUpRight,
    CheckCircle2,
    ChevronLeft, ChevronRight,
    Download,
    Edit,
    Image as ImageIcon, MoreVertical,
    Search,
    Trash2,
    UserPlus,
    Users,
    X,
    XCircle
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import api from '../utils/api';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [activeTab, setActiveTab] = useState('Employee list'); // Employee list | Directory | ORG Chart
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Form Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // add | edit
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [showActionDropdown, setShowActionDropdown] = useState(null); // id of employee
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRefs = useRef({});
  
  const [formData, setFormData] = useState({
    empId: '', firstName: '', lastName: '', email: '', temporaryPassword: '',
    phone: '', department: '', designation: '', joinDate: '', salary: '',
    status: 'active', photo: '', reportingManager: '', address: '',
    emergencyContact: '', bankDetails: '', dateOfBirth: '', personalEmail: '',
    altPhone: '', permanentAddress: ''
  });
  const [formError, setFormError] = useState('');

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/employees');
      setEmployees(data);
      const uniqueDeps = ['All', ...new Set(data.map(e => e.department))].filter(Boolean);
      setDepartments(uniqueDeps);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleOpenModal = (mode, employee = null) => {
    setModalMode(mode);
    setFormError('');
    setShowActionDropdown(null);
    if (employee) {
      setSelectedEmp(employee);
      setFormData({
        empId: employee.empId || '', 
        firstName: employee.firstName || '',
        lastName: employee.lastName || '', 
        email: employee.email || '',
        temporaryPassword: '', 
        phone: employee.phone || '',
        department: employee.department || '', 
        designation: employee.designation || '',
        joinDate: employee.joinDate ? new Date(employee.joinDate).toISOString().substring(0, 10) : '',
        salary: employee.salary || '', 
        status: employee.status || 'active',
        photo: employee.photo || '', 
        reportingManager: employee.reportingManager || '',
        address: employee.address || '', 
        emergencyContact: employee.emergencyContact || '',
        bankDetails: employee.bankDetails || '',
        dateOfBirth: employee.dateOfBirth ? new Date(employee.dateOfBirth).toISOString().substring(0, 10) : '',
        personalEmail: employee.personalEmail || '',
        altPhone: employee.altPhone || '',
        permanentAddress: employee.permanentAddress || ''
      });
    } else {
      setSelectedEmp(null);
      setFormData({
        empId: '', firstName: '', lastName: '', email: '', temporaryPassword: '',
        phone: '', department: '', designation: '', joinDate: new Date().toISOString().substring(0, 10),
        salary: '', status: 'active', photo: '', reportingManager: '', address: '',
        emergencyContact: '', bankDetails: '', dateOfBirth: '', personalEmail: '',
        altPhone: '', permanentAddress: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEmp(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, photo: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      if (modalMode === 'add') {
        await api.post('/employees', formData);
      } else {
        await api.put(`/employees/${selectedEmp.id}`, formData);
      }
      fetchEmployees();
      handleCloseModal();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to save employee details');
    }
  };

  const handleDeleteEmployee = async (id) => {
    setShowActionDropdown(null);
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await api.delete(`/employees/${id}`);
        fetchEmployees();
        setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to delete employee');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} employees?`)) {
      try {
        await Promise.all(selectedIds.map(id => api.delete(`/employees/${id}`)));
        setSelectedIds([]);
        fetchEmployees();
      } catch (err) {
        alert('Failed to delete some employees');
      }
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredEmployees.map(emp => emp.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleExportCSV = () => {
    const headers = ['Employee ID', 'Name', 'Email', 'Phone', 'Department', 'Designation', 'Status', 'Join Date'];
    const rows = filteredEmployees.map(emp => [
      emp.empId,
      `${emp.firstName} ${emp.lastName}`,
      emp.email,
      emp.phone || '',
      emp.department,
      emp.designation,
      emp.status,
      emp.joinDate ? new Date(emp.joinDate).toLocaleDateString() : ''
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `employees_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter logic
  const filteredEmployees = employees.filter(emp => {
    const matchSearch = 
      `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(search.toLowerCase()) || 
      emp.email.toLowerCase().includes(search.toLowerCase()) ||
      emp.empId.toLowerCase().includes(search.toLowerCase());
    const matchDept = department === 'All' || emp.department === department;
    return matchSearch && matchDept;
  });

  // Metrics calculations
  const totalCount = employees.length;
  const activeCount = employees.filter(e => e.status === 'active').length;
  const inactiveCount = employees.filter(e => e.status === 'inactive').length;
  const onboardingCount = employees.filter(e => e.status === 'onboarding' || e.status === 'pending').length;

  // Pagination logic
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-6">
      
      {/* 1. Page Header Tabs */}
      <div className="border-b border-border flex items-center justify-between">
        <div className="flex gap-8">
          {['Employee list', 'Directory', 'ORG Chart'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-semibold transition-all relative ${
                activeTab === tab 
                  ? 'text-primary' 
                  : 'text-secondary hover:text-primary'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'Employee list' && (
        <>
          {/* 2. Metric Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Metric 1 */}
            <div className="bg-white p-5 rounded-xl border border-border flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-primary">
                  <Users className="w-5 h-5" />
                </div>
                <span className="flex items-center gap-0.5 text-xs font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full">
                  +12% <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold tracking-tight text-primary">{totalCount}</h3>
                <p className="text-xs text-secondary mt-1 font-medium">Total Employee</p>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="bg-white p-5 rounded-xl border border-border flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-success">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <span className="flex items-center gap-0.5 text-xs font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full">
                  +8% <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold tracking-tight text-primary">{activeCount}</h3>
                <p className="text-xs text-secondary mt-1 font-medium">Active Employee</p>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="bg-white p-5 rounded-xl border border-border flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-danger">
                  <XCircle className="w-5 h-5" />
                </div>
                <span className="flex items-center gap-0.5 text-xs font-semibold text-danger bg-danger/10 px-2 py-0.5 rounded-full">
                  -2% <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold tracking-tight text-primary">{inactiveCount}</h3>
                <p className="text-xs text-secondary mt-1 font-medium">Inactive Employee</p>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="bg-white p-5 rounded-xl border border-border flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-warning">
                  <UserPlus className="w-5 h-5" />
                </div>
                <span className="flex items-center gap-0.5 text-xs font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full">
                  +4% <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold tracking-tight text-primary">{onboardingCount}</h3>
                <p className="text-xs text-secondary mt-1 font-medium">Onboarding</p>
              </div>
            </div>

          </div>

          {/* 3. Controls and Search */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search & Dept Filter */}
            <div className="w-full md:w-auto flex flex-1 items-center gap-3">
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                <input
                  type="text"
                  placeholder="Search by name, ID or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-border rounded-lg text-sm text-text-primary placeholder-secondary focus:outline-none focus:border-primary focus:ring-0 transition-colors"
                />
              </div>

              {/* Department Filter */}
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="bg-white border border-border text-secondary text-sm rounded-lg px-3 py-2 outline-none focus:border-primary transition-colors"
              >
                <option value="All">All Departments</option>
                {departments.filter(d => d !== 'All').map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="w-full md:w-auto flex items-center gap-3 justify-end">
              {selectedIds.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 border border-red-200 text-danger font-semibold text-sm px-4 py-2 rounded-lg transition-colors w-full md:w-auto shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Selected ({selectedIds.length})</span>
                </button>
              )}
              <button
                onClick={handleExportCSV}
                className="flex items-center justify-center gap-2 bg-white hover:bg-background border border-border text-text-primary font-semibold text-sm px-4 py-2 rounded-lg transition-colors w-full md:w-auto shadow-sm"
              >
                <Download className="w-4 h-4 text-secondary" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => handleOpenModal('add')}
                className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors w-full md:w-auto shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Employee</span>
              </button>
            </div>

          </div>

          {/* 4. Data Table */}
          <div className="bg-white rounded-xl border border-border overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-background/40 border-b border-border text-xs text-secondary font-bold uppercase tracking-wider">
                    <th className="p-4 w-12 text-center">
                      <input 
                        type="checkbox" 
                        onChange={handleSelectAll}
                        checked={filteredEmployees.length > 0 && selectedIds.length === filteredEmployees.length}
                        className="rounded border-border text-primary focus:ring-0 cursor-pointer"
                      />
                    </th>
                    <th className="p-4">Employee</th>
                    <th className="p-4">Employee ID</th>
                    <th className="p-4">Department</th>
                    <th className="p-4">Designation</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 w-16 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="p-12 text-center">
                        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
                      </td>
                    </tr>
                  ) : currentItems.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-12 text-center text-secondary">
                        No employees found matching the filters.
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((emp) => (
                      <tr key={emp.id} className="hover:bg-background/20 transition-colors">
                        <td className="p-4 text-center">
                          <input 
                            type="checkbox" 
                            checked={selectedIds.includes(emp.id)}
                            onChange={() => handleSelectRow(emp.id)}
                            className="rounded border-border text-primary focus:ring-0 cursor-pointer"
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/10 overflow-hidden shrink-0">
                              {emp.photo ? (
                                <img src={emp.photo} alt={emp.firstName} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-primary text-sm bg-primary/5 uppercase">
                                  {emp.firstName[0]}{emp.lastName ? emp.lastName[0] : ''}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-text-primary truncate">{emp.firstName} {emp.lastName}</p>
                              <p className="text-xs text-secondary truncate">{emp.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-medium text-text-primary">{emp.empId}</td>
                        <td className="p-4 text-secondary">{emp.department || 'N/A'}</td>
                        <td className="p-4 text-secondary">{emp.designation || 'N/A'}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            emp.status === 'active' 
                              ? 'text-success border-success bg-transparent' 
                              : emp.status === 'inactive' || emp.status === 'terminated'
                              ? 'text-danger border-danger bg-transparent'
                              : 'text-warning border-warning bg-transparent'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                              emp.status === 'active' ? 'bg-success' : emp.status === 'inactive' || emp.status === 'terminated' ? 'bg-danger' : 'bg-warning'
                            }`} />
                            <span className="capitalize">{emp.status || 'Active'}</span>
                          </span>
                        </td>
                        <td className="p-4 text-center relative">
                          <button
                            ref={(el) => (buttonRefs.current[emp.id] = el)}
                            onClick={() => {
                              if (showActionDropdown === emp.id) {
                                setShowActionDropdown(null);
                              } else {
                                const button = buttonRefs.current[emp.id];
                                if (button) {
                                  const rect = button.getBoundingClientRect();
                                  setDropdownPosition({
                                    top: rect.bottom + window.scrollY + 8,
                                    left: rect.left + window.scrollX - 120 // 120 is width of dropdown minus some offset
                                  });
                                }
                                setShowActionDropdown(emp.id);
                              }
                            }}
                            className="p-1 text-secondary hover:text-primary hover:bg-background rounded transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          
                          {/* Row Actions Menu */}
                          {showActionDropdown === emp.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setShowActionDropdown(null)} />
                              <div 
                                className="fixed w-36 bg-white border border-border rounded-lg shadow-xl z-50 py-2"
                                style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
                              >
                                <button
                                  onClick={() => handleOpenModal('edit', emp)}
                                  className="w-full text-left px-4 py-2 text-xs text-text-primary hover:bg-background flex items-center gap-2"
                                >
                                  <Edit className="w-4 h-4 text-secondary" /> Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteEmployee(emp.id)}
                                  className="w-full text-left px-4 py-2 text-xs text-danger hover:bg-red-50 flex items-center gap-2"
                                >
                                  <Trash2 className="w-4 h-4 text-danger" /> Delete
                                </button>
                              </div>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* 5. Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-border flex items-center justify-between">
                <p className="text-xs text-secondary font-medium">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredEmployees.length)} of {filteredEmployees.length} entries
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 border border-border rounded hover:bg-background text-secondary disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-7 h-7 text-xs font-semibold rounded flex items-center justify-center transition-colors ${
                        currentPage === page
                          ? 'bg-primary text-white'
                          : 'border border-border hover:bg-background text-secondary'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 border border-border rounded hover:bg-background text-secondary disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'Directory' && (
        <div className="bg-white border border-border rounded-xl p-8 text-center text-secondary font-medium shadow-soft">
          <Users className="w-12 h-12 mx-auto mb-3 text-secondary/50" />
          <h4 className="text-base text-text-primary font-bold">Organizational Directory</h4>
          <p className="text-xs text-secondary mt-1 max-w-md mx-auto">Explore all staff contacts, extensions, and seating locations inside the interactive directory card hub.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {filteredEmployees.map(emp => (
              <div key={emp.id} className="border border-border rounded-xl p-4 text-left hover:border-secondary transition-colors">
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 overflow-hidden shrink-0">
                    {emp.photo ? (
                      <img src={emp.photo} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-primary text-sm bg-primary/5 uppercase">
                        {emp.firstName?.[0]}{emp.lastName?.[0]}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h5 className="font-bold text-text-primary truncate text-sm">{emp.firstName} {emp.lastName}</h5>
                    <p className="text-xs text-secondary truncate">{emp.designation}</p>
                    <p className="text-[11px] text-secondary truncate font-mono mt-1">{emp.phone || 'No phone number'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'ORG Chart' && (
        <div className="bg-white border border-border rounded-xl p-8 text-center text-secondary font-medium shadow-soft">
          <Users className="w-12 h-12 mx-auto mb-3 text-secondary/50" />
          <h4 className="text-base text-text-primary font-bold">Interactive Org Chart</h4>
          <p className="text-xs text-secondary mt-1 max-w-md mx-auto">View the reporting hierarchies and structures for all departments in a tree navigation view.</p>
          <div className="mt-8 flex flex-col items-center">
            {/* Render a beautiful mockup hierarchy */}
            <div className="border border-border p-3 rounded-lg bg-background font-bold text-xs">CEO & Founder</div>
            <div className="w-0.5 h-6 bg-border" />
            <div className="flex gap-16 border-t border-border pt-6">
              <div className="flex flex-col items-center">
                <div className="border border-border p-3 rounded-lg bg-background text-xs font-bold">HR Director</div>
                <div className="w-0.5 h-6 bg-border" />
                <div className="border border-border p-3 rounded-lg bg-white text-xs text-secondary">HR Team</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="border border-border p-3 rounded-lg bg-background text-xs font-bold">Engineering Lead</div>
                <div className="w-0.5 h-6 bg-border" />
                <div className="border border-border p-3 rounded-lg bg-white text-xs text-secondary">Dev Team</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-border">
            <div className="sticky top-0 z-10 flex justify-between items-center px-6 py-4 border-b border-border bg-white">
              <h4 className="text-base font-bold text-text-primary">
                {modalMode === 'add' ? 'Register New Staff Member' : 'Edit Staff Record'}
              </h4>
              <button onClick={handleCloseModal} className="p-1 text-secondary hover:bg-background rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
              {formError && (
                <div className="p-3 bg-danger/10 border border-danger/25 rounded-lg text-danger text-xs flex items-center gap-2 font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {formError}
                </div>
              )}

              <div className="flex items-center gap-4 p-4 bg-background border border-border border-dashed rounded-lg">
                <div className="shrink-0 relative">
                  {formData.photo ? (
                    <img src={formData.photo} alt="Avatar" className="w-16 h-16 rounded-lg object-cover border border-border" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-white border border-border flex flex-col items-center justify-center text-secondary cursor-pointer hover:bg-background/50 transition-colors">
                      <ImageIcon className="w-6 h-6 mb-0.5" />
                      <span className="text-[10px] font-bold">Upload</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-text-primary">Upload Profile Image</h5>
                  <p className="text-[11px] text-secondary mt-0.5">Supports PNG, JPG up to 1MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1.5">Employee ID</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. EMP1001"
                    value={formData.empId} 
                    onChange={e => setFormData(p => ({ ...p, empId: e.target.value }))} 
                    className="w-full px-3 py-2 bg-white border border-border text-text-primary text-sm rounded-lg outline-none focus:border-primary transition-colors placeholder:text-gray-300" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1.5">First Name</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.firstName} 
                    onChange={e => setFormData(p => ({ ...p, firstName: e.target.value }))} 
                    className="w-full px-3 py-2 bg-white border border-border text-text-primary text-sm rounded-lg outline-none focus:border-primary transition-colors" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1.5">Last Name</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.lastName} 
                    onChange={e => setFormData(p => ({ ...p, lastName: e.target.value }))} 
                    className="w-full px-3 py-2 bg-white border border-border text-text-primary text-sm rounded-lg outline-none focus:border-primary transition-colors" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1.5">Company Email</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email} 
                    onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} 
                    className="w-full px-3 py-2 bg-white border border-border text-text-primary text-sm rounded-lg outline-none focus:border-primary transition-colors" 
                  />
                </div>
                {modalMode === 'add' && (
                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-1.5">Login Password</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Assign a password"
                      value={formData.temporaryPassword} 
                      onChange={e => setFormData(p => ({ ...p, temporaryPassword: e.target.value }))} 
                      className="w-full px-3 py-2 bg-white border border-border text-text-primary text-sm rounded-lg outline-none focus:border-primary transition-colors" 
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1.5">Phone Number</label>
                  <input 
                    type="text" 
                    value={formData.phone} 
                    onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} 
                    className="w-full px-3 py-2 bg-white border border-border text-text-primary text-sm rounded-lg outline-none focus:border-primary transition-colors" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1.5">Department</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.department} 
                    onChange={e => setFormData(p => ({ ...p, department: e.target.value }))} 
                    className="w-full px-3 py-2 bg-white border border-border text-text-primary text-sm rounded-lg outline-none focus:border-primary transition-colors" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1.5">Designation</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.designation} 
                    onChange={e => setFormData(p => ({ ...p, designation: e.target.value }))} 
                    className="w-full px-3 py-2 bg-white border border-border text-text-primary text-sm rounded-lg outline-none focus:border-primary transition-colors" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1.5">Monthly Salary (INR)</label>
                  <input 
                    type="number" 
                    required 
                    value={formData.salary} 
                    onChange={e => setFormData(p => ({ ...p, salary: e.target.value }))} 
                    className="w-full px-3 py-2 bg-white border border-border text-text-primary text-sm rounded-lg outline-none focus:border-primary transition-colors" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1.5">Status</label>
                  <select 
                    value={formData.status} 
                    onChange={e => setFormData(p => ({ ...p, status: e.target.value }))} 
                    className="w-full px-3 py-2 bg-white border border-border text-text-primary text-sm rounded-lg outline-none focus:border-primary transition-colors"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="onboarding">Onboarding</option>
                    <option value="terminated">Terminated</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1.5">Join Date</label>
                  <input 
                    type="date" 
                    value={formData.joinDate} 
                    onChange={e => setFormData(p => ({ ...p, joinDate: e.target.value }))} 
                    className="w-full px-3 py-2 bg-white border border-border text-text-primary text-sm rounded-lg outline-none focus:border-primary transition-colors" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1.5">Date of Birth</label>
                  <input 
                    type="date" 
                    value={formData.dateOfBirth} 
                    onChange={e => setFormData(p => ({ ...p, dateOfBirth: e.target.value }))} 
                    className="w-full px-3 py-2 bg-white border border-border text-text-primary text-sm rounded-lg outline-none focus:border-primary transition-colors" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1.5">Personal Email</label>
                  <input 
                    type="email" 
                    value={formData.personalEmail} 
                    onChange={e => setFormData(p => ({ ...p, personalEmail: e.target.value }))} 
                    className="w-full px-3 py-2 bg-white border border-border text-text-primary text-sm rounded-lg outline-none focus:border-primary transition-colors" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1.5">Alternative Phone</label>
                  <input 
                    type="text" 
                    value={formData.altPhone} 
                    onChange={e => setFormData(p => ({ ...p, altPhone: e.target.value }))} 
                    className="w-full px-3 py-2 bg-white border border-border text-text-primary text-sm rounded-lg outline-none focus:border-primary transition-colors" 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-secondary mb-1.5">Permanent Address</label>
                  <textarea 
                    value={formData.permanentAddress} 
                    onChange={e => setFormData(p => ({ ...p, permanentAddress: e.target.value }))} 
                    rows={2}
                    className="w-full px-3 py-2 bg-white border border-border text-text-primary text-sm rounded-lg outline-none focus:border-primary transition-colors resize-none" 
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-border">
                <button 
                  type="button" 
                  onClick={handleCloseModal} 
                  className="px-4 py-2 bg-white border border-border hover:bg-background text-text-primary text-sm font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
                >
                  {modalMode === 'add' ? 'Add Employee' : 'Update Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

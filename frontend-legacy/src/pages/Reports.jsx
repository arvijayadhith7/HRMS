import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { motion } from 'framer-motion';
import { Users, TrendingUp, PieChart, Download, Calendar } from 'lucide-react';

export default function Reports() {
  const [deptStats, setDeptStats] = useState([]);
  const [payrollHistory, setPayrollHistory] = useState([]);
  const [leaveStats, setLeaveStats] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const { data: dept } = await api.get('/reports/departments');
      setDeptStats(dept);

      const { data: pay } = await api.get('/reports/payroll-history');
      setPayrollHistory(pay);

      const { data: leaves } = await api.get('/reports/leaves');
      setLeaveStats(leaves);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  const getMonthName = (m) => {
    const dates = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return dates[m - 1] || 'Month';
  };

  const downloadCSV = (data, filename, headers) => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += headers.join(",") + "\n";
    
    data.forEach(row => {
      csvContent += Object.values(row).map(val => `"${val}"`).join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportDepartmentReport = () => {
    const data = deptStats.map(d => ({
      Department: d.department,
      Headcount: d._count.id
    }));
    downloadCSV(data, "headcount_by_department.csv", ["Department", "Headcount"]);
  };

  const exportPayrollHistoryReport = () => {
    const data = payrollHistory.map(p => ({
      Period: `${getMonthName(p.month)} ${p.year}`,
      TotalPaid: p._sum.netSalary,
      Payslips: p._count.id
    }));
    downloadCSV(data, "payroll_history_report.csv", ["Period", "Total Paid (INR)", "Total Payslips Generated"]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-bold text-text-primary tracking-tight">Analytics & Reports</h2>
          <p className="text-sm text-text-secondary mt-1">Audit department headcount ratios, monthly salary histories, and leave indexes.</p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-text-secondary flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
            <p>Aggregating visual summaries...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Department Headcount Bar Progress Chart */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-surface border border-border rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <span>Headcount by Department</span>
              </h4>
              <button
                onClick={exportDepartmentReport}
                className="flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-primary bg-background border border-border px-3 py-2 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            </div>

            {deptStats.length === 0 ? (
              <div className="p-8 text-center text-text-secondary text-sm">No active department datasets found.</div>
            ) : (
              <div className="space-y-6">
                {deptStats.map(d => {
                  const totalHead = deptStats.reduce((acc, curr) => acc + curr._count.id, 0);
                  const pct = ((d._count.id / totalHead) * 100).toFixed(0);
                  return (
                    <div key={d.department} className="space-y-2 group">
                      <div className="flex justify-between text-sm font-bold text-text-secondary group-hover:text-primary transition-colors">
                        <span>{d.department}</span>
                        <span>{d._count.id} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-background border border-border h-2.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-primary h-full rounded-full transition-all duration-1000 ease-out" 
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Monthly payroll reports chart lists */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-surface border border-border rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-success" />
                <span>Monthly Payroll History</span>
              </h4>
              <button
                onClick={exportPayrollHistoryReport}
                className="flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-primary bg-background border border-border px-3 py-2 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            </div>

            {payrollHistory.length === 0 ? (
              <div className="p-8 text-center text-text-secondary text-sm">No disbursement history recorded.</div>
            ) : (
              <div className="space-y-4">
                {payrollHistory.map(p => (
                  <div key={`${p.year}-${p.month}`} className="flex items-center justify-between p-4 bg-background border border-border rounded-xl hover:border-primary transition-colors cursor-default">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-surface rounded-lg border border-border">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <span className="block font-bold text-base text-text-primary">{getMonthName(p.month)} {p.year}</span>
                        <span className="text-xs text-text-secondary font-bold">{p._count.id} Payslips processed</span>
                      </div>
                    </div>
                    <span className="text-lg font-extrabold text-primary">₹{p._sum.netSalary.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Leave Type Indexes */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-surface border border-border rounded-xl shadow-sm p-6 lg:col-span-2">
            <h4 className="text-lg font-bold text-text-primary flex items-center gap-2 mb-6">
              <PieChart className="w-5 h-5 text-warning" />
              <span>Leave Utilization Ledger Counts</span>
            </h4>

            {leaveStats.length === 0 ? (
              <div className="p-8 text-center text-text-secondary text-sm">No leave records parsed.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {leaveStats.map((l, idx) => (
                  <div key={idx} className="bg-background border border-border p-6 rounded-xl hover:border-primary transition-colors group">
                    <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block capitalize group-hover:text-primary transition-colors">{l.leaveType} — {l.status}</span>
                    <h5 className="text-3xl font-extrabold text-text-primary mt-3">{l._count.id} <span className="text-sm font-bold text-text-secondary">Logs</span></h5>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

        </div>
      )}
    </div>
  );
}
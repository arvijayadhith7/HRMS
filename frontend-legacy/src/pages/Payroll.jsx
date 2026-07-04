import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { jsPDF } from 'jspdf';
import { motion } from 'framer-motion';
import { Settings, CreditCard, Calculator, CheckCircle, AlertCircle, FileText, Check, Trash2, Download } from 'lucide-react';

export default function Payroll() {
  const [payrolls, setPayrolls] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errMessage, setErrMessage] = useState('');

  const fetchPayrolls = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/payroll', {
        params: { month, year }
      });
      setPayrolls(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrolls();
  }, [month, year]);

  const handleGeneratePayroll = async () => {
    setLoading(true);
    setMessage('');
    setErrMessage('');
    try {
      const { data } = await api.post('/payroll/generate', { month, year });
      setMessage(data.message);
      fetchPayrolls();
    } catch (err) {
      setErrMessage(err.response?.data?.error || 'Failed to generate payroll');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/payroll/${id}`, { status });
      fetchPayrolls();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update payroll status');
    }
  };

  const handleDeletePayroll = async (id) => {
    if (window.confirm('Delete this payslip permanently?')) {
      try {
        await api.delete(`/payroll/${id}`);
        fetchPayrolls();
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to delete payroll');
      }
    }
  };

  const getMonthName = (m) => {
    const dates = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return dates[m - 1] || 'Month';
  };

  const exportPayslipPDF = (p) => {
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    
    // Top border line
    doc.setLineWidth(0.3);
    doc.line(15, 20, 195, 20);

    // Header Title
    doc.setTextColor(92, 45, 145); // Purple
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('EMPLOYEE PAYSLIP', 15, 32);

    // Logo (Varsa Academy approximation)
    doc.setFontSize(18);
    doc.setTextColor(76, 175, 80); // Green
    doc.text('Varsa', 135, 32);
    doc.setTextColor(0, 0, 0);
    doc.text('Academy', 156, 32);
    
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    // Using letter-spacing by adding spaces
    doc.text('L E A R N  I T . E A R N  I T', 142, 38);

    // Employee Details Section
    let startY = 45;
    doc.setLineWidth(0.1);
    
    const drawDetailsRow = (label, value, y) => {
      doc.rect(15, y, 180, 8); // full width row
      doc.line(75, y, 75, y + 8); // vertical divider
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(label, 17, y + 5.5);
      doc.text(value, 77, y + 5.5);
    };

    drawDetailsRow('Employee Name', `${p.employee.firstName} ${p.employee.lastName}`.toUpperCase(), startY);
    drawDetailsRow('Employee ID', p.employee.empId, startY + 8);
    drawDetailsRow('Designation', p.employee.designation, startY + 16);
    drawDetailsRow('Department', p.employee.department || '', startY + 24);
    
    const monthStr = `${getMonthName(p.month).substring(0, 3)}-${p.year.toString().substring(2)}`;
    drawDetailsRow('Month', monthStr, startY + 32);

    // Gap
    startY += 48;

    // Earnings/Deductions Table
    const drawSalaryRow = (col1, col2, col3, col4, y, isHeader = false, isBold = false) => {
      doc.rect(15, y, 180, 8);
      // Vertical lines
      doc.line(75, y, 75, y + 8);
      doc.line(115, y, 115, y + 8);
      doc.line(160, y, 160, y + 8);

      if (isHeader) {
        doc.setTextColor(92, 45, 145);
        doc.setFont('helvetica', 'bold');
      } else if (isBold) {
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
      }

      doc.setFontSize(10);
      
      // Col 1
      doc.text(col1, 17, y + 5.5);
      
      // Col 2
      if (col2) {
         if (isHeader) {
           doc.text(col2, 95, y + 5.5, { align: 'center' });
         } else {
           doc.setFont('helvetica', 'normal');
           doc.text('₹', 77, y + 5.5);
           if (isBold) doc.setFont('helvetica', 'bold');
           doc.text(col2, 113, y + 5.5, { align: 'right' });
         }
      }

      // Col 3
      doc.text(col3, 117, y + 5.5);

      // Col 4
      if (col4) {
         if (isHeader) {
           doc.text(col4, 177, y + 5.5, { align: 'center' });
         } else {
           doc.setFont('helvetica', 'normal');
           doc.text('₹', 162, y + 5.5);
           if (isBold) doc.setFont('helvetica', 'bold');
           doc.text(col4, 193, y + 5.5, { align: 'right' });
         }
      }
    };

    const formatNum = (num) => num === 0 ? '-' : num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    drawSalaryRow('EARNINGS', 'Amount', 'DEDUCTIONS', 'Amount', startY, true);
    
    drawSalaryRow('Basic Salary', formatNum(p.basicSalary), '', '', startY + 8);
    drawSalaryRow('HRA', formatNum(p.hra), 'Other Deduction', formatNum(p.deductions), startY + 16);
    drawSalaryRow('Dearness Allowance (DA)', formatNum(0), '', '', startY + 24);
    drawSalaryRow('Other Allowance', formatNum(p.allowances), 'Total Deductions (B)', formatNum(p.deductions), startY + 32);
    
    const grossSalary = p.basicSalary + p.hra + p.allowances;
    drawSalaryRow('Gross Salary (A)', formatNum(grossSalary), '', '-', startY + 40, false, true);

    // Gap of 8 before Net Salary (No borders drawn for gap row)
    drawSalaryRow('Net Salary', formatNum(p.netSalary), 'Deduction', '-', startY + 56, false, true);

    doc.save(`Payslip_${p.employee.empId}_${getMonthName(p.month)}_${p.year}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary tracking-tight">Payroll Management</h2>
          <p className="text-sm text-text-secondary mt-1">Generate monthly payslips and dispatch staff salary approvals.</p>
        </div>
        <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-surface border border-border rounded-lg text-sm font-bold text-text-primary hover:bg-background transition-colors flex items-center gap-2 shadow-sm">
              <Settings className="w-4 h-4" /> Settings
            </button>
            <button className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm">
              <CreditCard className="w-4 h-4" /> Bank Transfer
            </button>
        </div>
      </div>

      {/* Month/Year selector & Action panel */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-surface rounded-xl border border-border shadow-sm p-6 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-6 w-full lg:w-auto">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Payroll Month</label>
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="bg-background border border-border text-sm text-text-primary rounded-lg px-4 py-2.5 outline-none focus:border-primary w-48 transition-colors"
              >
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                  <option key={m} value={m}>{getMonthName(m)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Payroll Year</label>
              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="bg-background border border-border text-sm text-text-primary rounded-lg px-4 py-2.5 outline-none focus:border-primary w-32 transition-colors"
              >
                {[2024, 2025, 2026, 2027, 2028].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="w-full lg:w-auto shrink-0 pt-2 lg:pt-0">
            <button
              disabled={loading}
              onClick={handleGeneratePayroll}
              className="w-full flex items-center justify-center space-x-2 bg-primary-dark hover:bg-primary-dark/90 text-white text-sm font-bold px-6 py-3 rounded-lg transition-all shadow-sm"
            >
              <Calculator className="w-4 h-4" />
              <span>Generate Monthly Payslips</span>
            </button>
          </div>
        </div>

        {message && (
          <div className="relative z-10 mt-6 p-4 bg-success/10 border border-success/20 rounded-lg text-success text-sm font-bold flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {message}
          </div>
        )}
        {errMessage && (
          <div className="relative z-10 mt-6 p-4 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm font-bold flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {errMessage}
          </div>
        )}
      </motion.div>

      {/* Payslip list table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-border flex justify-between items-center">
          <h4 className="text-lg font-bold text-text-primary flex items-center gap-2">
            Payslips for {getMonthName(month)} {year}
          </h4>
          <span className="text-xs text-text-secondary font-bold bg-background px-3 py-1.5 rounded-full border border-border">{payrolls.length} Records</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-text-secondary">Loading...</div>
        ) : payrolls.length === 0 ? (
          <div className="p-12 text-center text-text-secondary">No salaries generated for this month. Run "Generate Monthly Payslips" above.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-background/40 border-b border-border text-xs text-secondary font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold tracking-wider">Employee</th>
                  <th className="px-6 py-4 text-xs font-bold tracking-wider">Basic/HRA</th>
                  <th className="px-6 py-4 text-xs font-bold tracking-wider">Allowances/Deductions</th>
                  <th className="px-6 py-4 text-xs font-bold tracking-wider">Net Salary</th>
                  <th className="px-6 py-4 text-xs font-bold tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {payrolls.map(p => (
                  <tr key={p.id} className="hover:bg-background transition-colors">
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                          {p.employee.firstName[0]}
                        </div>
                        <div>
                          <p className="font-bold text-text-primary">{p.employee.firstName} {p.employee.lastName}</p>
                          <p className="text-xs text-text-secondary">ID: {p.employee.empId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="block font-bold text-text-primary">Basic: ₹{p.basicSalary.toLocaleString('en-IN')}</span>
                      <span className="text-xs text-text-secondary">HRA: ₹{p.hra.toLocaleString('en-IN')}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="block font-bold text-text-primary">Allow: ₹{p.allowances.toLocaleString('en-IN')}</span>
                      <span className="text-xs text-danger">Deduct: ₹{p.deductions.toLocaleString('en-IN')}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-primary text-lg">
                      ₹{p.netSalary.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                        p.status === 'paid'
                          ? 'bg-success/10 text-success border-success/30'
                          : p.status === 'approved'
                          ? 'bg-primary/10 text-primary border-primary/30'
                          : 'bg-warning/10 text-warning border-warning/30'
                      }`}>
                        {p.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => exportPayslipPDF(p)}
                        className="p-1.5 bg-background hover:bg-surface text-text-secondary hover:text-text-primary rounded-lg transition-colors border border-border inline-flex items-center"
                        title="Export PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      
                      {p.status === 'pending' && (
                        <button
                          onClick={() => handleStatusChange(p.id, 'approved')}
                          className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-all text-xs font-bold"
                        >
                          Approve
                        </button>
                      )}

                      {p.status === 'approved' && (
                        <button
                          onClick={() => handleStatusChange(p.id, 'paid')}
                          className="px-3 py-1.5 bg-success/10 hover:bg-success/20 text-success rounded-lg transition-all text-xs font-bold inline-flex items-center gap-1"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Disburse</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDeletePayroll(p.id)}
                        className="p-1.5 hover:bg-danger/10 text-text-secondary hover:text-danger rounded-lg transition-colors inline-flex items-center"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
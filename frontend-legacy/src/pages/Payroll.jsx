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

  const exportPayslipPDF = async (p) => {
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    
    // --- Colors & Branding ---
    const primaryColor = [92, 45, 145]; // Purple (#5C2D91)
    const secondaryColor = [100, 100, 100]; // Slate gray
    const textColor = [33, 37, 41]; // Dark gray/black
    const lightBg = [248, 249, 250]; // Light gray background
    const borderGray = [222, 226, 230]; // Soft border color
    const successColor = [40, 167, 69]; // Safe Green

    // --- 1. Header (Logo & Company Title) ---
    try {
      const response = await fetch('/logo.png');
      const blob = await response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob); 
      await new Promise(resolve => {
        reader.onloadend = () => {
          const base64data = reader.result;
          doc.addImage(base64data, 'PNG', 15, 12, 24, 24); 
          resolve();
        }
      });
    } catch (e) {
      console.warn("Could not load logo", e);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(...primaryColor);
    doc.text('VIRTUAL NEST', 44, 21);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...secondaryColor);
    doc.text('C R E A T E   -   C O N N E C T   -   G R O W', 44, 26);
    doc.text('Email: contact@virtualnest.com | Web: www.virtualnest.com', 44, 31);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...primaryColor);
    doc.text('PAYSLIP', 195, 21, { align: 'right' });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...textColor);
    const monthStr = `${getMonthName(p.month)} ${p.year}`;
    doc.text(`Pay Period: ${monthStr}`, 195, 27, { align: 'right' });
    doc.text(`Status: ${p.status.toUpperCase()}`, 195, 32, { align: 'right' });

    // Header divider line
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(15, 39, 195, 39);

    // --- 2. Employee Details Block ---
    let y = 46;
    doc.setFillColor(...lightBg);
    doc.rect(15, y, 180, 28, 'F');
    doc.setDrawColor(...borderGray);
    doc.setLineWidth(0.2);
    doc.rect(15, y, 180, 28, 'S');

    // Grid divider
    doc.line(105, y, 105, y + 28);

    const drawDetail = (label, val, x, currY) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...secondaryColor);
      doc.text(label, x, currY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...textColor);
      doc.text(String(val), x + 32, currY);
    };

    const joinDateStr = p.employee.joinDate ? new Date(p.employee.joinDate).toLocaleDateString('en-GB').replace(/\//g, '-') : 'N/A';

    // Left Column
    drawDetail('Employee Name:', `${p.employee.firstName} ${p.employee.lastName}`, 18, y + 6);
    drawDetail('Employee ID:', p.employee.empId, 18, y + 12);
    drawDetail('Designation:', p.employee.designation || 'N/A', 18, y + 18);
    drawDetail('Department:', p.employee.department || 'N/A', 18, y + 24);

    // Right Column
    drawDetail('Date of Joining:', joinDateStr, 108, y + 6);
    drawDetail('Bank A/c No.:', p.employee.bankDetails || 'N/A', 108, y + 12);
    drawDetail('PAN Number:', p.employee.pan || 'N/A', 108, y + 18);
    drawDetail('PF Universal No:', 'N/A', 108, y + 24);

    // --- 3. Salary Breakdown Table ---
    y += 36;
    
    // Table Header Band
    doc.setFillColor(...primaryColor);
    doc.rect(15, y, 180, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text('EARNINGS', 18, y + 5.5);
    doc.text('AMOUNT', 102, y + 5.5, { align: 'right' });
    doc.text('DEDUCTIONS', 108, y + 5.5);
    doc.text('AMOUNT', 192, y + 5.5, { align: 'right' });

    // Table Content Rows
    const conveyance = 1000;
    const medical = 1250;
    const special = p.allowances - conveyance - medical > 0 ? p.allowances - conveyance - medical : 0;
    const gross = p.basicSalary + p.hra + p.allowances;

    const earnings = [
      { name: 'Basic Pay (50% of Gross)', amt: p.basicSalary },
      { name: 'House Rent Allowance (HRA)', amt: p.hra },
      { name: 'Conveyance Allowance', amt: conveyance },
      { name: 'Medical Allowance', amt: medical },
      { name: 'Special Allowance (Balancing)', amt: special }
    ];

    const deductions = [
      { name: 'Provident Fund (PF)', amt: 0 },
      { name: 'Employee State Insurance (ESI)', amt: 0 },
      { name: 'Professional Tax (PT)', amt: 0 },
      { name: 'Other Deductions', amt: p.deductions },
      { name: '', amt: null } // Empty spacing
    ];

    let rowY = y + 8;
    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'normal');

    for (let i = 0; i < 5; i++) {
      // Draw background stripe on alternate rows
      if (i % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(15, rowY, 180, 7, 'F');
      }

      // Border guidelines
      doc.setDrawColor(...borderGray);
      doc.line(15, rowY + 7, 195, rowY + 7);
      doc.line(105, rowY, 105, rowY + 7); // Center divider

      // Earnings
      doc.setFont('helvetica', 'normal');
      doc.text(earnings[i].name, 18, rowY + 5);
      doc.text(Math.round(earnings[i].amt).toLocaleString('en-IN'), 102, rowY + 5, { align: 'right' });

      // Deductions
      if (deductions[i].name) {
        doc.text(deductions[i].name, 108, rowY + 5);
        doc.text(Math.round(deductions[i].amt).toLocaleString('en-IN'), 192, rowY + 5, { align: 'right' });
      }

      rowY += 7;
    }

    // --- 4. Totals Row ---
    doc.setFillColor(...lightBg);
    doc.rect(15, rowY, 180, 8, 'F');
    doc.setDrawColor(...borderGray);
    doc.line(15, rowY + 8, 195, rowY + 8);
    doc.line(105, rowY, 105, rowY + 8);

    doc.setFont('helvetica', 'bold');
    doc.text('Gross Earnings (A)', 18, rowY + 5.5);
    doc.text(Math.round(gross).toLocaleString('en-IN'), 102, rowY + 5.5, { align: 'right' });

    doc.text('Total Deductions (B)', 108, rowY + 5.5);
    doc.text(Math.round(p.deductions).toLocaleString('en-IN'), 192, rowY + 5.5, { align: 'right' });

    // Outer border for the table
    doc.setDrawColor(...borderGray);
    doc.rect(15, y, 180, (rowY - y) + 8, 'S');

    // --- 5. Net Pay Section ---
    y = rowY + 16;
    doc.setFillColor(243, 240, 248); // Very light violet branding color
    doc.rect(15, y, 180, 14, 'F');
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.3);
    doc.rect(15, y, 180, 14, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...primaryColor);
    doc.text('NET TAKE HOME (A - B)', 20, y + 8.5);
    
    doc.setFontSize(14);
    doc.text(`INR ${Math.round(p.netSalary).toLocaleString('en-IN')}/-`, 190, y + 9.5, { align: 'right' });

    // Net pay in words (robust Indian numbering system converter)
    const numberToWords = (num) => {
      const a = [
        '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
        'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
      ];
      const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

      const convert = (n) => {
        if (n < 20) return a[n];
        if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
        if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + convert(n % 100) : '');
        if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + convert(n % 1000) : '');
        if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + convert(n % 100000) : '');
        return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + convert(n % 10000000) : '');
      };

      const val = Math.round(num);
      if (val === 0) return 'Rupees Zero Only';
      return 'Rupees ' + convert(val) + ' Only';
    };
    
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(...secondaryColor);
    doc.text(numberToWords(p.netSalary), 20, y + 20);

    // --- 6. CTC Summary ---
    y += 28;
    doc.setFillColor(...lightBg);
    doc.rect(15, y, 180, 14, 'F');
    doc.setDrawColor(...borderGray);
    doc.setLineWidth(0.2);
    doc.rect(15, y, 180, 14, 'S');
    doc.line(105, y, 105, y + 14);

    drawDetail('Monthly CTC:', `INR ${Math.round(gross).toLocaleString('en-IN')}`, 18, y + 9);
    drawDetail('Annualized CTC:', `INR ${Math.round(gross * 12).toLocaleString('en-IN')}`, 108, y + 9);

    // --- 7. Signatures and Disclaimers ---
    y += 32;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...secondaryColor);
    doc.text('Note: This is a system-generated payslip and does not require a physical signature.', 15, y);
    doc.text('Employer contributions to PF and ESI are not currently applicable.', 15, y + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...textColor);
    doc.text('For Virtual Nest Pvt Ltd', 195, y, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.text('Authorized Signatory', 195, y + 15, { align: 'right' });

    // Save File
    doc.save(`Payslip_${p.employee.empId}_${getMonthName(p.month)}_${p.year}.pdf`);
  };

  const exportCompanyPayrollPDF = async () => {
    if (payrolls.length === 0) return;
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    
    let logoBase64 = null;
    try {
      const response = await fetch('/logo.png');
      const blob = await response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob); 
      logoBase64 = await new Promise(resolve => {
        reader.onloadend = () => resolve(reader.result);
      });
    } catch (e) {
      console.warn("Could not load logo", e);
    }

    const primaryColor = [92, 45, 145]; 
    const secondaryColor = [100, 100, 100]; 
    const textColor = [33, 37, 41]; 
    const lightBg = [248, 249, 250]; 
    const borderGray = [222, 226, 230]; 

    const numberToWords = (num) => {
      const a = [
        '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
        'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
      ];
      const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

      const convert = (n) => {
        if (n < 20) return a[n];
        if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
        if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + convert(n % 100) : '');
        if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + convert(n % 1000) : '');
        if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + convert(n % 100000) : '');
        return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + convert(n % 10000000) : '');
      };

      const val = Math.round(num);
      if (val === 0) return 'Rupees Zero Only';
      return 'Rupees ' + convert(val) + ' Only';
    };

    payrolls.forEach((p, index) => {
      if (index > 0) {
        doc.addPage();
      }

      if (logoBase64) {
        doc.addImage(logoBase64, 'PNG', 15, 12, 24, 24); 
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(...primaryColor);
      doc.text('VIRTUAL NEST', 44, 21);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...secondaryColor);
      doc.text('C R E A T E   -   C O N N E C T   -   G R O W', 44, 26);
      doc.text('Email: contact@virtualnest.com | Web: www.virtualnest.com', 44, 31);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(...primaryColor);
      doc.text('PAYSLIP', 195, 21, { align: 'right' });
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...textColor);
      const monthStr = `${getMonthName(p.month)} ${p.year}`;
      doc.text(`Pay Period: ${monthStr}`, 195, 27, { align: 'right' });
      doc.text(`Status: ${p.status.toUpperCase()}`, 195, 32, { align: 'right' });

      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(0.5);
      doc.line(15, 39, 195, 39);

      let y = 46;
      doc.setFillColor(...lightBg);
      doc.rect(15, y, 180, 28, 'F');
      doc.setDrawColor(...borderGray);
      doc.setLineWidth(0.2);
      doc.rect(15, y, 180, 28, 'S');

      doc.line(105, y, 105, y + 28);

      const drawDetail = (label, val, x, currY) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...secondaryColor);
        doc.text(label, x, currY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...textColor);
        doc.text(String(val), x + 32, currY);
      };

      const joinDateStr = p.employee.joinDate ? new Date(p.employee.joinDate).toLocaleDateString('en-GB').replace(/\//g, '-') : 'N/A';

      drawDetail('Employee Name:', `${p.employee.firstName} ${p.employee.lastName}`, 18, y + 6);
      drawDetail('Employee ID:', p.employee.empId, 18, y + 12);
      drawDetail('Designation:', p.employee.designation || 'N/A', 18, y + 18);
      drawDetail('Department:', p.employee.department || 'N/A', 18, y + 24);

      drawDetail('Date of Joining:', joinDateStr, 108, y + 6);
      drawDetail('Bank A/c No.:', p.employee.bankDetails || 'N/A', 108, y + 12);
      drawDetail('PAN Number:', p.employee.pan || 'N/A', 108, y + 18);
      drawDetail('PF Universal No:', 'N/A', 108, y + 24);

      y += 36;
      doc.setFillColor(...primaryColor);
      doc.rect(15, y, 180, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text('EARNINGS', 18, y + 5.5);
      doc.text('AMOUNT', 102, y + 5.5, { align: 'right' });
      doc.text('DEDUCTIONS', 108, y + 5.5);
      doc.text('AMOUNT', 192, y + 5.5, { align: 'right' });

      const conveyance = 1000;
      const medical = 1250;
      const special = p.allowances - conveyance - medical > 0 ? p.allowances - conveyance - medical : 0;
      const gross = p.basicSalary + p.hra + p.allowances;

      const earnings = [
        { name: 'Basic Pay (50% of Gross)', amt: p.basicSalary },
        { name: 'House Rent Allowance (HRA)', amt: p.hra },
        { name: 'Conveyance Allowance', amt: conveyance },
        { name: 'Medical Allowance', amt: medical },
        { name: 'Special Allowance (Balancing)', amt: special }
      ];

      const deductions = [
        { name: 'Provident Fund (PF)', amt: 0 },
        { name: 'Employee State Insurance (ESI)', amt: 0 },
        { name: 'Professional Tax (PT)', amt: 0 },
        { name: 'Other Deductions', amt: p.deductions },
        { name: '', amt: null }
      ];

      let rowY = y + 8;
      doc.setTextColor(...textColor);
      doc.setFont('helvetica', 'normal');

      for (let i = 0; i < 5; i++) {
        if (i % 2 === 0) {
          doc.setFillColor(250, 250, 250);
          doc.rect(15, rowY, 180, 7, 'F');
        }
        doc.setDrawColor(...borderGray);
        doc.line(15, rowY + 7, 195, rowY + 7);
        doc.line(105, rowY, 105, rowY + 7);

        doc.setFont('helvetica', 'normal');
        doc.text(earnings[i].name, 18, rowY + 5);
        doc.text(Math.round(earnings[i].amt).toLocaleString('en-IN'), 102, rowY + 5, { align: 'right' });

        if (deductions[i].name) {
          doc.text(deductions[i].name, 108, rowY + 5);
          doc.text(Math.round(deductions[i].amt).toLocaleString('en-IN'), 192, rowY + 5, { align: 'right' });
        }
        rowY += 7;
      }

      doc.setFillColor(...lightBg);
      doc.rect(15, rowY, 180, 8, 'F');
      doc.setDrawColor(...borderGray);
      doc.line(15, rowY + 8, 195, rowY + 8);
      doc.line(105, rowY, 105, rowY + 8);

      doc.setFont('helvetica', 'bold');
      doc.text('Gross Earnings (A)', 18, rowY + 5.5);
      doc.text(Math.round(gross).toLocaleString('en-IN'), 102, rowY + 5.5, { align: 'right' });

      doc.text('Total Deductions (B)', 108, rowY + 5.5);
      doc.text(Math.round(p.deductions).toLocaleString('en-IN'), 192, rowY + 5.5, { align: 'right' });

      doc.setDrawColor(...borderGray);
      doc.rect(15, y, 180, (rowY - y) + 8, 'S');

      y = rowY + 16;
      doc.setFillColor(243, 240, 248);
      doc.rect(15, y, 180, 14, 'F');
      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(0.3);
      doc.rect(15, y, 180, 14, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...primaryColor);
      doc.text('NET TAKE HOME (A - B)', 20, y + 8.5);
      
      doc.setFontSize(14);
      doc.text(`INR ${Math.round(p.netSalary).toLocaleString('en-IN')}/-`, 190, y + 9.5, { align: 'right' });

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(...secondaryColor);
      doc.text(numberToWords(p.netSalary), 20, y + 20);

      y += 28;
      doc.setFillColor(...lightBg);
      doc.rect(15, y, 180, 14, 'F');
      doc.setDrawColor(...borderGray);
      doc.setLineWidth(0.2);
      doc.rect(15, y, 180, 14, 'S');
      doc.line(105, y, 105, y + 14);

      drawDetail('Monthly CTC:', `INR ${Math.round(gross).toLocaleString('en-IN')}`, 18, y + 9);
      drawDetail('Annualized CTC:', `INR ${Math.round(gross * 12).toLocaleString('en-IN')}`, 108, y + 9);

      y += 32;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...secondaryColor);
      doc.text('Note: This is a system-generated payslip and does not require a physical signature.', 15, y);
      doc.text('Employer contributions to PF and ESI are not currently applicable.', 15, y + 4.5);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...textColor);
      doc.text('For Virtual Nest Pvt Ltd', 195, y, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.text('Authorized Signatory', 195, y + 15, { align: 'right' });
    });

    doc.save(`Company_Payroll_Report_${getMonthName(month)}_${year}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary tracking-tight">Payroll Management</h2>
          <p className="text-sm text-text-secondary mt-1">Generate monthly payslips and dispatch staff salary approvals.</p>
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

          <div className="w-full lg:w-auto shrink-0 pt-2 lg:pt-0 flex gap-3">
            <button
              disabled={loading}
              onClick={handleGeneratePayroll}
              className="flex items-center justify-center space-x-2 bg-primary-dark hover:bg-primary-dark/90 text-white text-sm font-bold px-6 py-3 rounded-lg transition-all shadow-sm"
            >
              <Calculator className="w-4 h-4" />
              <span>Generate Monthly Payslips</span>
            </button>

            {payrolls.length > 0 && (
              <button
                onClick={exportCompanyPayrollPDF}
                className="flex items-center justify-center space-x-2 bg-success text-white text-sm font-bold px-6 py-3 rounded-lg hover:bg-success/90 transition-all shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Download Company Payroll</span>
              </button>
            )}
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
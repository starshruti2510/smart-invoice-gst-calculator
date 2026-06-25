import React, { useState, useEffect } from 'react';
const rawApiUrl = import.meta.env.VITE_API_URL || '';
const API_URL = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl;

const InvoiceForm = () => {
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: '',
    clientName: '',
    transactionType: 'Intra-State',
    items: [{ itemName: '', price: 0, quantity: 1, gstRate: 18 }]
  });

  const [savedInvoices, setSavedInvoices] = useState([]);
  const [viewMode, setViewMode] = useState(() => {
    const savedMode = localStorage.getItem('invoiceViewMode');
    return savedMode === 'list' || savedMode === 'form' ? savedMode : 'form';
  });
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    window.clearTimeout(showToast.timeoutId);
    showToast.timeoutId = window.setTimeout(() => {
      setToast({ message: '', type: '' });
    }, 3200);
  };

  // Input fields badalne par state update karne ke liye
  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const updatedItems = [...invoiceData.items];
    updatedItems[index][name] = name === 'itemName' ? value : Number(value);
    setInvoiceData({ ...invoiceData, items: updatedItems });
  };

  // Nayi row add karne ke liye
  const addItemRow = () => {
    setInvoiceData({
      ...invoiceData,
      items: [...invoiceData.items, { itemName: '', price: 0, quantity: 1, gstRate: 18 }]
    });
  };

  // Row delete karne ke liye
  const removeItemRow = (index) => {
    const updatedItems = invoiceData.items.filter((_, i) => i !== index);
    setInvoiceData({ ...invoiceData, items: updatedItems });
  };

  // Screen par live GST aur Total calculate karne ke liye helper
  const calculateSummary = () => {
    let taxableTotal = 0;
    let totalGst = 0;

    invoiceData.items.forEach(item => {
      const baseValue = (item.price || 0) * (item.quantity || 0);
      taxableTotal += baseValue;
      totalGst += baseValue * (item.gstRate / 100);
    });

    return {
      taxableTotal,
      cgstTotal: invoiceData.transactionType === 'Intra-State' ? totalGst / 2 : 0,
      sgstTotal: invoiceData.transactionType === 'Intra-State' ? totalGst / 2 : 0,
      igstTotal: invoiceData.transactionType === 'Inter-State' ? totalGst : 0,
      grandTotal: taxableTotal + totalGst
    };
  };

  const summary = calculateSummary();

  const formatDate = (value) => {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Backend se saare purane invoices mangane ke liye function
  const fetchInvoices = async () => {
    try {
      const targetUrl = API_URL ? `${API_URL}/api/invoices` : 'http://localhost:5000/api/invoices';
      const res = await fetch(targetUrl);
      const data = await res.json();
      setSavedInvoices(data);
      return data;
    } catch (err) {
      console.error('Issue fetching invoices:', err);
      return null;
    }
  };

  // Form submit karke backend mein data save karne ke liye
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const targetUrl = API_URL ? `${API_URL}/api/invoices` : 'http://localhost:5000/api/invoices';
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData)
      });
      const resBody = await response.json().catch(() => null);
      if (response.ok) {
        showToast('Invoice saved successfully!', 'success');
        
        // Auto-increment invoice number if it ends in digits
        const currentInvNumber = invoiceData.invoiceNumber;
        let nextInvNumber = '';
        const match = currentInvNumber.match(/(\d+)$/);
        if (match) {
          const numPart = match[0];
          const incrementedNum = parseInt(numPart, 10) + 1;
          const paddedNum = String(incrementedNum).padStart(numPart.length, '0');
          nextInvNumber = currentInvNumber.substring(0, currentInvNumber.length - numPart.length) + paddedNum;
        }

        // Reset details
        setInvoiceData({
          invoiceNumber: nextInvNumber,
          clientName: '',
          transactionType: invoiceData.transactionType,
          items: [{ itemName: '', price: 0, quantity: 1, gstRate: 18 }]
        });

        await fetchInvoices(); // List refresh karne ke liye
      } else {
        console.error('Save failed:', resBody);
        const errorMessage = resBody?.message || '';
        if (errorMessage.includes('duplicate key') || errorMessage.includes('E11000')) {
          showToast('Save failed: Invoice Number already exists!', 'error');
        } else {
          showToast(errorMessage || 'Save failed: duplicate invoice', 'error');
        }
      }
    } catch (err) {
      console.error('Error saving invoice:', err);
      showToast('Error saving invoice. Please check your connection and try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleStoreInvoices = async () => {
    if (viewMode === 'list') {
      setViewMode('form');
      return;
    }

    setLoadingInvoices(true);
    try {
      const data = await fetchInvoices();
      if (data === null) {
        showToast('Unable to load invoices right now. Please try again later.', 'error');
        return;
      }
      if (!data.length) {
        showToast('No invoices available yet. Create at least one invoice first.', 'info');
        return;
      }
      setViewMode('list');
    } finally {
      setLoadingInvoices(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    localStorage.setItem('invoiceViewMode', viewMode);
  }, [viewMode]);

  if (viewMode === 'list') {
    return (
      <div className="invoice-page" style={{ padding: '30px', fontFamily: 'Inter, sans-serif', maxWidth: '1080px', margin: 'auto', color: '#1f2937', background: 'linear-gradient(180deg, #e7e9ef 0%, #e8eaee 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '28px' }}>
          <div>
            <p style={{ margin: '0', fontSize: '14px', fontWeight: '700', color: '#2563eb', letterSpacing: '0.2em' }}>Stored Invoices</p>
            <h2 style={{ margin: '10px 0 8px', fontSize: '32px', color: '#1e293b' }}>Your Saved Invoices</h2>
            <p style={{ margin: '0', maxWidth: '640px', fontSize: '15px', color: '#475569', lineHeight: '1.7' }}>All saved invoices from the database are shown below for review.</p>
          </div>
          <button type="button" onClick={() => setViewMode('form')} style={{ background: '#4338ca', border: 'none', color: '#fff', padding: '12px 22px', borderRadius: '999px', fontWeight: '700', cursor: 'pointer' }}>Back to Create</button>
        </div>

        <div className="table-wrapper" style={{ overflowX: 'auto', background: '#f9f2f2', borderRadius: '20px', boxShadow: '0 18px 55px rgba(15,23,42,0.08)', border: '1px solid rgba(148,163,184,0.25)' }}>
          <table className="invoice-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#eef2ff', borderBottom: '2px solid #c7d2fe' }}>
                <th style={{ padding: '14px 18px', color: '#4338ca' }}>Invoice No.</th>
                <th style={{ padding: '14px 18px', color: '#4338ca' }}>Client</th>
                <th style={{ padding: '14px 18px', color: '#4338ca' }}>Date</th>
                <th style={{ padding: '14px 18px', color: '#4338ca' }}>Items</th>
                <th style={{ padding: '14px 18px', color: '#4338ca' }}>Grand Total</th>
              </tr>
            </thead>
            <tbody>
              {savedInvoices.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                    {loadingInvoices ? 'Loading saved invoices...' : 'No invoices saved yet. Go back and create one.'}
                  </td>
                </tr>
              ) : (
                savedInvoices.map((inv) => (
                  <tr key={inv._id} style={{ borderBottom: '1px solid #f1f5f9', verticalAlign: 'top' }}>
                    <td style={{ padding: '12px 15px', fontWeight: '700', color: '#2563eb' }}>{inv.invoiceNumber}</td>
                    <td style={{ padding: '12px 15px' }}>{inv.clientName}</td>
                    <td style={{ padding: '12px 15px', fontSize: '14px', color: '#475569' }}>{formatDate(inv.date)}</td>
                    <td style={{ padding: '12px 15px', maxWidth: '260px', fontSize: '14px', color: '#334155' }}>
                      {inv.items?.length ? (
                        <ul style={{ margin: 0, paddingLeft: '18px', lineHeight: '1.6' }}>
                          {inv.items.slice(0, 3).map((item, index) => (
                            <li key={index} style={{ listStyleType: 'disc' }}>{item.itemName || 'Unnamed item'}</li>
                          ))}
                          {inv.items.length > 3 && <li style={{ color: '#94a3b8' }}>+ {inv.items.length - 3} more</li>}
                        </ul>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>No items</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 15px', fontFamily: 'monospace', fontWeight: '700', color: '#10b981' }}>₹{inv.grandTotal?.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="invoice-page" style={{ padding: '30px', fontFamily: 'Inter, sans-serif', maxWidth: '1080px', margin: 'auto', color: '#1f2937', background: 'linear-gradient(180deg, #eef2ff 0%, #ffffff 100%)' }}>
      <div className="hero-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '24px', flexWrap: 'wrap', marginBottom: '30px' }}>
        <div style={{ flex: '1 1 520px', minWidth: '300px' }}>
          <p style={{ margin: '0', fontSize: '14px', fontWeight: '700', color: '#2563eb', letterSpacing: '0.2em' }}>GST INVOICE TOOL</p>
          <h2 style={{ margin: '12px 0 10px', fontSize: '36px', color: '#1e293b', lineHeight: '1.05' }}>Smart Invoice + GST Calculator</h2>
          <p style={{ margin: '0', maxWidth: '680px', fontSize: '16px', color: '#475569', lineHeight: '1.7' }}>Create clean invoices, calculate GST instantly, and save records. Built for freelancers, small businesses, and digital heroes.</p>
        </div>
        <button onClick={handleStoreInvoices} style={{ alignSelf: 'center', background: 'linear-gradient(135deg, #208197, #0d5f99)', border: 'none', color: '#fff', padding: '14px 20px', borderRadius: '980px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 10px 24px rgba(16, 185, 129, 0.18)', minWidth: '190px' }}>Store All Invoices</button>
      </div>

      <div className="hero-card" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', padding: '22px 24px', borderRadius: '18px', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 16px 40px rgba(15, 23, 42, 0.05)', marginBottom: '35px' }}>
      <a href="https://digitalheroesco.com" target="_blank" rel="noreferrer" style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f766e, #10b981)',
      color: '#fff',
      padding: '12px 28px',
      borderRadius: '999px',
      textDecoration: 'none',
      fontWeight: '700',
      fontSize: '15px',
      letterSpacing: '0.3px',
      boxShadow: '0 8px 20px rgba(16, 185, 129, 0.25)'
      }}>Created for Digital Heroes</a>
        <div style={{ minWidth: '220px', textAlign: 'right' }}>
          <p style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: '700', color: '#111827' }}>Reach out anytime</p>
          <p style={{ margin: '0', fontSize: '15px', color: '#334155' }}>Shruti Sharma</p>
          <p style={{ margin: '6px 0 0', fontSize: '15px' }}><a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=shrutisharma87860@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                color: '#2563eb',
                textDecoration: 'none',
                fontWeight: '600'
                }}
                >
                shrutisharma87860@gmail.com
                </a></p>
        </div>
      </div>

      {/* Invoice creation form */}
      <form className="invoice-form" onSubmit={handleSubmit} style={{ background: '#ffffff', padding: '28px', borderRadius: '20px', boxShadow: '0 22px 80px rgba(15,23,42,0.08)', border: '1px solid rgba(148,163,184,0.2)' }}>
        <div className="form-row" style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ fontWeight: '700', display: 'block', marginBottom: '8px', color: '#334155' }}>Invoice Number</label>
            <input type="text" placeholder="e.g., INV-001" required value={invoiceData.invoiceNumber} onChange={e => setInvoiceData({...invoiceData, invoiceNumber: e.target.value})} style={{ padding: '12px 14px', width: '100%', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none' }} />
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ fontWeight: '700', display: 'block', marginBottom: '8px', color: '#334155' }}>Client Name</label>
            <input type="text" placeholder="Client Name" required value={invoiceData.clientName} onChange={e => setInvoiceData({...invoiceData, clientName: e.target.value})} style={{ padding: '12px 14px', width: '100%', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none' }} />
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ fontWeight: '700', display: 'block', marginBottom: '8px', color: '#334155' }}>Transaction Type</label>
            <select value={invoiceData.transactionType} onChange={e => setInvoiceData({...invoiceData, transactionType: e.target.value})} style={{ padding: '12px 14px', width: '100%', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a' }}>
              <option value="Intra-State">Intra-State (CGST + SGST)</option>
              <option value="Inter-State">Inter-State (IGST)</option>
            </select>
          </div>
        </div>

        <h3 style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '8px', marginBottom: '15px', color: '#475569' }}>Items Table</h3>
        {invoiceData.items.map((item, index) => (
          <div key={index} className="item-row" style={{ display: 'flex', gap: '15px', marginBottom: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input type="text" name="itemName" placeholder="Item Name" required value={item.itemName} onChange={e => handleItemChange(index, e)} style={{ padding: '12px', flex: 3, minWidth: '150px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc' }} />
            <input type="number" name="price" placeholder="Price (₹)" min="0" required value={item.price || ''} onChange={e => handleItemChange(index, e)} style={{ padding: '12px', flex: 1, minWidth: '80px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc' }} />
            <input type="number" name="quantity" placeholder="Qty" min="1" required value={item.quantity} onChange={e => handleItemChange(index, e)} style={{ padding: '12px', width: '70px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc' }} />
            <select name="gstRate" value={item.gstRate} onChange={e => handleItemChange(index, e)} style={{ padding: '12px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a' }}>
              <option value="0">0% GST</option>
              <option value="5">5% GST</option>
              <option value="12">12% GST</option>
              <option value="18">18% GST</option>
              <option value="28">28% GST</option>
            </select>
            {invoiceData.items.length > 1 && (
              <button type="button" onClick={() => removeItemRow(index)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Remove</button>
            )}
          </div>
        ))}
        
        <button type="button" onClick={addItemRow} style={{ background: '#4338ca', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '999px', cursor: 'pointer', fontWeight: '700', marginBottom: '25px', boxShadow: '0 12px 24px rgba(67,56,202,0.18)' }}>+ Add Row</button>

        {/* Dynamic calculation summary */}
        <div style={{ background: '#111827', color: '#f8fafc', padding: '24px', borderRadius: '18px', textAlign: 'right', boxShadow: '0 16px 50px rgba(15,23,42,0.15)' }}>
          <p style={{ margin: '5px 0', color: '#94a3b8' }}>Total Taxable Amount: <strong style={{ color: '#fff', fontFamily: 'monospace' }}>₹{summary.taxableTotal.toFixed(2)}</strong></p>
          {invoiceData.transactionType === 'Intra-State' ? (
            <>
              <p style={{ margin: '5px 0', color: '#94a3b8' }}>CGST (Central Tax): <span style={{ color: '#fff', fontFamily: 'monospace' }}>₹{summary.cgstTotal.toFixed(2)}</span></p>
              <p style={{ margin: '5px 0', color: '#94a3b8' }}>SGST (State Tax): <span style={{ color: '#fff', fontFamily: 'monospace' }}>₹{summary.sgstTotal.toFixed(2)}</span></p>
            </>
          ) : (
            <p style={{ margin: '5px 0', color: '#94a3b8' }}>IGST (Integrated Tax): <span style={{ color: '#fff', fontFamily: 'monospace' }}>₹{summary.igstTotal.toFixed(2)}</span></p>
          )}
          <hr style={{ borderColor: '#334155', margin: '10px 0' }} />
          <h3 style={{ margin: '0', color: '#10b981' }}>Grand Total: <span style={{ fontFamily: 'monospace', marginLeft: '10px' }}>₹{summary.grandTotal.toFixed(2)}</span></h3>
        </div>

        <button type="submit" disabled={saving} style={{ width: '100%', background: saving ? '#94a3b8' : '#10b981', color: '#fff', padding: '14px', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: saving ? 'not-allowed' : 'pointer', marginTop: '20px', transition: 'background 0.2s' }}>
          {saving ? 'Saving & Generating...' : 'Save & Generate Invoice'}
        </button>
      </form>

      {toast.message && (
        <div className={toast.type === 'error' ? 'toast toast-error' : 'toast'} style={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          left: '16px',
          maxWidth: '360px',
          width: 'auto',
          padding: '16px 18px',
          borderRadius: '18px',
          boxSizing: 'border-box',
          boxShadow: '0 18px 45px rgba(15,23,42,0.18)',
          color: '#fff',
          zIndex: 9999,
          background: toast.type === 'error' ? 'linear-gradient(135deg, #ef4444, #b91c1c)' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
          wordBreak: 'break-word'
        }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: '15px', lineHeight: '1.4' }}>{toast.message}</p>
        </div>
      )}
    </div>
  );
};

export default InvoiceForm;
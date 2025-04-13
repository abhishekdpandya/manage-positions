import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function App() {
  const [form, setForm] = useState({
    SecurityCode: 'INF',
    Quantity: '',
    Action: 'INSERT',
    BuySell: 'Buy',
    TradeID:''
  });
  const [seachForm, setSearchForm] = useState({
    TradeIDtoSearch: '',
    SecurityCodetoSearch: ''
  });
  const [positions, setPositions] = useState([]);
  const [editableIndex, setEditableIndex] = useState(null);
  const [editData, setEditData] = useState({});
  const [searchResults, setSearchResults] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };
  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e, index) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        [name]: value
      }
    }));
  };

  const submitTransaction = async () => {
    const transaction = {
      SecurityCode: form.SecurityCode,
      Quantity: parseInt(form.Quantity),
      Action: 'INSERT',
      BuySell: form.BuySell,
      TradeID : form.TradeID
    };

    try {
      const res = await axios.post('http://localhost:4000/transaction', transaction);
      setPositions(res.data.positions || []);
    } catch (err) {
      console.error('Transaction failed', err);
    }
  };

  const updateTransaction = async (index) => {
    const original = searchResults[index];
    const updated = {
      TradeID: original.TradeID,
      Version: original.Version + 1,
      SecurityCode: editData[index].SecurityCode,
      Quantity: parseInt(editData[index].Quantity),
      Action: 'UPDATE',
      BuySell: editData[index].BuySell,
      TransactionNumber:original.TransactionNumber
    };

    try {
      const res = await axios.post('http://localhost:4000/transaction', updated);
      setPositions(res.data.positions || []);
      searchTransactions();
      setEditableIndex(null);
    } catch (err) {
      console.error('Update failed', err);
    }
  };

  const cancelTransaction = async (index) => {
    const original = searchResults[index];
    const cancelled = {
      TradeID: original.TradeID,
      Version: original.Version + 1,
      SecurityCode: original.SecurityCode,
      Quantity: original.Quantity,
      Action: 'CANCEL',
      BuySell: original.BuySell,
      TransactionNumber : original.TransactionNumber
    };

    try {
      const res = await axios.post('http://localhost:4000/transaction', cancelled);
      setPositions(res.data.positions || []);
      searchTransactions();
    } catch (err) {
      console.error('Cancel failed', err);
    }
  };

  const fetchPositions = async () => {
    try {
      const res = await axios.get('http://localhost:4000/positions');
      setPositions(res.data || []);
    } catch (err) {
      console.error('Fetching positions failed', err);
    }
  };
  const searchTransactions = async () => {
    const { TradeIDtoSearch, SecurityCodetoSearch } = seachForm;
    console.log(TradeIDtoSearch,SecurityCodetoSearch)
    try {
      const res = await axios.get('http://localhost:4000/transactions', {
        params: { TradeIDtoSearch, SecurityCodetoSearch }
      });
      setSearchResults(res.data);
    } catch (err) {
      console.error('Search failed', err);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  const styles = {
    container: {
      maxWidth: '960px',
      margin: '0 auto',
      padding: '24px',
      backgroundColor: 'white',
      border: '1px solid #ccc',
      borderRadius: '8px',
      fontFamily: 'Arial, sans-serif'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '16px'
    },
    subtitle: {
      fontSize: '20px',
      fontWeight: '600',
      marginTop: '24px',
      marginBottom: '8px'
    },
    formGrid: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      marginBottom: '16px',
      marginTop:'16px'
    },
    input: {
      padding: '8px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      minWidth: '120px'
    },
    button: {
      padding: '8px 12px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      marginRight: '4px',
      marginTop: '8px'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      backgroundColor: 'white'
    },
    thtd: {
      border: '1px solid #ccc',
      padding: '8px',
      textAlign: 'left'
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Equity Positions Manager</h1>

      <div style={styles.formGrid}>
      <input
          name="TradeID"
          value={form.TradeID}
          onChange={handleChange}
          placeholder="Trade ID"
          style={styles.input}
        />
      <select name="SecurityCode" value={form.SecurityCode} onChange={handleChange} style={styles.input}>
          <option>INF</option>
          <option>ITC</option>
          <option>RIL</option>
        </select>
        <input
          name="Quantity"
          value={form.Quantity}
          onChange={handleChange}
          placeholder="Quantity"
          style={styles.input}
        />
        <select name="BuySell" value={form.BuySell} onChange={handleChange} style={styles.input}>
          <option>Buy</option>
          <option>Sell</option>
        </select>
        <button onClick={submitTransaction} style={{ ...styles.button, backgroundColor: '#007bff', color: 'white' }}>Add Transaction</button>
      </div>
      <h2 style={styles.subtitle}>Positions</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.thtd}>Security</th>
            <th style={styles.thtd}>Position</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(positions).map((sec, index) => {
            console.log(positions);
            return (
              <tr key={index}>
                
                <td style={styles.thtd}>
                 
                    {sec}
                  
                </td>
                <td style={styles.thtd}>{Object.values(positions)[index]}</td>
                
              </tr>
            );
          })}
        </tbody>
      </table>
      <h2 style={styles.subtitle}>Search Transactions</h2>
      <div style={styles.formGrid}>
        <input name="TradeIDtoSearch" value={seachForm.TradeIDtoSearch} onChange={handleSearchChange} placeholder="Search by Trade ID" style={styles.input} />
        <input name="SecurityCodetoSearch" value={seachForm.SecurityCodetoSearch}  onChange={handleSearchChange} placeholder="Search by Security Code" style={styles.input} />
        <button onClick={searchTransactions} style={{ ...styles.button, backgroundColor: '#17a2b8', color: 'white' }}>Search</button>
      </div>
      <h2 style={styles.subtitle}>Transactions</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.thtd}>#</th>
            <th style={styles.thtd}>TradeID</th>
            <th style={styles.thtd}>Version</th>
            <th style={styles.thtd}>Security</th>
            <th style={styles.thtd}>Quantity</th>
            <th style={styles.thtd}>Buy/Sell</th>
            <th style={styles.thtd}>Transaction Type</th>
            <th style={styles.thtd}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {searchResults.map((txn, index) => {
            const isEditing = editableIndex === index;
            return (
              <tr key={index}>
                <td style={styles.thtd}>{index + 1}</td>
                <td style={styles.thtd}>{txn.TradeID}</td>
                <td style={styles.thtd}>{txn.Version}</td>
                <td style={styles.thtd}>
                  {isEditing ? (
                    <input
                      name="SecurityCode"
                      value={editData[index]?.SecurityCode || txn.SecurityCode}
                      onChange={(e) => handleEditChange(e, index)}
                      style={styles.input}
                    />
                  ) : (
                    txn.SecurityCode
                  )}
                </td>
                <td style={styles.thtd}>
                  {isEditing ? (
                    <input
                      name="Quantity"
                      value={editData[index]?.Quantity || txn.Quantity}
                      onChange={(e) => handleEditChange(e, index)}
                      style={styles.input}
                    />
                  ) : (
                    txn.Quantity
                  )}
                </td>
                <td style={styles.thtd}>
                  {isEditing ? (
                    <select
                      name="BuySell"
                      value={editData[index]?.BuySell || txn.BuySell}
                      onChange={(e) => handleEditChange(e, index)}
                      style={styles.input}
                    >
                      <option>Buy</option>
                      <option>Sell</option>
                    </select>
                  ) : (
                    txn.BuySell
                  )}
                </td>
                <td style={styles.thtd}>{txn.Action}</td>
                <td style={styles.thtd}>
                  {isEditing ? (
                    <>
                      <button onClick={() => updateTransaction(index)} style={{ ...styles.button, backgroundColor: '#28a745', color: 'white' }}>Save</button>
                      <button onClick={() => setEditableIndex(null)} style={{ ...styles.button, backgroundColor: '#6c757d', color: 'white' }}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => {
                        setEditableIndex(index);
                        setEditData(prev => ({
                          ...prev,
                          [index]: {
                            SecurityCode: txn.SecurityCode,
                            Quantity: txn.Quantity,
                            BuySell: txn.BuySell
                          }
                        }));
                      }} style={{ ...styles.button, backgroundColor: '#ffc107', color: 'black' }}>Edit</button>
                      <button onClick={() => cancelTransaction(index)} style={{ ...styles.button, backgroundColor: '#dc3545', color: 'white' }}>Cancel Transaction</button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
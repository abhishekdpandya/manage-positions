const express = require('express');
const cors = require('cors');
const app = express();
const port = 4000;

// Middleware
app.use(express.json());
app.use(cors());

// In-memory storage for positions and transactions
let transactions = [];
let positions = {}; // Object to store total position per SecurityCode

// Endpoint to get all positions
app.get('/positions', (req, res) => {
  res.json(positions);
});

// Endpoint to get transactions by TradeID and/or SecurityCode
app.get('/transactions', (req, res) => {
  const { TradeIDtoSearch, SecurityCodetoSearch } = req.query;
  
  let result = transactions;

  if (TradeIDtoSearch) {
    result = result.filter(txn => txn.TradeID.toString() === TradeIDtoSearch);
  }

  if (SecurityCodetoSearch) {
    result = result.filter(txn => txn.SecurityCode === SecurityCodetoSearch);
  }

  res.json(result);
});

// Function to update total position for each security code
const updatePositions = () => {
  positions = {}; // Reset positions

  transactions.forEach((txn) => {
    if (txn.Action === 'INSERT' || txn.Action === 'UPDATE') {
      const qty = txn.BuySell === 'Sell' ? -txn.Quantity : txn.Quantity;
      if (positions[txn.SecurityCode]) {
        positions[txn.SecurityCode] += qty;
      } else {
        positions[txn.SecurityCode] = qty;
      }
    } else if (txn.Action === 'CANCEL') {
      const qty = txn.BuySell === 'Sell' ? txn.Quantity : -txn.Quantity;
      if (positions[txn.SecurityCode]) {
        positions[txn.SecurityCode] += qty;
      } else {
        positions[txn.SecurityCode] = qty;
      }
    }
  });
};

// Endpoint to handle transactions (INSERT, UPDATE, CANCEL)
app.post('/transaction', (req, res) => {
  const { TransactionNumber, TradeID, Version, SecurityCode, Quantity, Action, BuySell } = req.body;

  let transaction;
  if (Action === 'INSERT') {
    // Insert a new transaction with version 1
    transaction = {
      TransactionNumber:Math.floor(Math.random() * 1000000000),
      TradeID,
      Version: 1,
      SecurityCode,
      Quantity,
      Action,
      BuySell,
      
    };
    transactions.push(transaction);
  } else if (Action === 'UPDATE') {
    // Find the transaction by TradeID and Version and update it
    const idx = transactions.findIndex(txn => txn.TradeID === TradeID);
    if (idx !== -1) {
      const updatedTxn = {
        ...transactions[idx],
        Version: transactions[idx].Version + 1, // Increment version
        Action,
        Quantity,
        BuySell,
        TransactionNumber:Math.floor(Math.random() * 1000000000),
      };
      transactions.push(updatedTxn);
    }
  } else if (Action === 'CANCEL') {
    // Mark the transaction as canceled and set version as the last version
    const idx = transactions.findIndex(txn => txn.TransactionNumber === TransactionNumber);
    if (idx !== -1) {
      const canceledTxn = {
        ...transactions[idx],
        Action: 'CANCEL',
        TransactionNumber:Math.floor(Math.random() * 1000000000),
        Version: (transactions.filter(txn => txn.TradeID === TradeID)).length + 1 // Increment version for cancel action
      };
      transactions.push(canceledTxn);
    }
  }

  // Update the positions after each transaction
  updatePositions();

  // Return the updated positions
  res.json({ positions });
});

// Starting the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

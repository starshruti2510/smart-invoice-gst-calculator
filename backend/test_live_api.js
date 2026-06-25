const BACKEND_URL = 'https://smart-invoice-gst-calculator.onrender.com';

async function test() {
  console.log('Testing Live Backend API...');
  
  // Generating a unique invoice number to avoid duplicate key errors
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const testInvoice = {
    invoiceNumber: `TEST-INV-${randomNum}`,
    clientName: 'Live Test Client',
    transactionType: 'Intra-State',
    items: [
      { itemName: 'Product Alpha', price: 150, quantity: 2, gstRate: 18 },
      { itemName: 'Product Beta', price: 300, quantity: 1, gstRate: 12 }
    ]
  };

  console.log(`\n1. Posting new invoice: ${testInvoice.invoiceNumber} with 2 items...`);
  try {
    const postRes = await fetch(`${BACKEND_URL}/api/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testInvoice)
    });
    
    console.log(`Status Code: ${postRes.status}`);
    const postData = await postRes.json();
    console.log('Response Body:', JSON.stringify(postData, null, 2));

    if (postRes.ok) {
      console.log('\n✅ Invoice SAVED successfully on live backend!');
    } else {
      console.log('\n❌ Failed to save invoice on live backend.');
    }
  } catch (error) {
    console.error('Error during POST:', error);
  }

  console.log('\n2. Fetching all invoices from live backend...');
  try {
    const getRes = await fetch(`${BACKEND_URL}/api/invoices`);
    console.log(`Status Code: ${getRes.status}`);
    const getData = await getRes.json();
    console.log(`Total invoices found: ${getData.length}`);
    if (getData.length > 0) {
      console.log('Latest Invoice Number:', getData[0].invoiceNumber);
      console.log('Latest Client:', getData[0].clientName);
    }
    console.log('\n✅ Fetching worked successfully on live backend!');
  } catch (error) {
    console.error('Error during GET:', error);
  }
}

test();

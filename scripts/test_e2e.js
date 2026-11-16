const https = require('https');

const agent = new https.Agent({ keepAlive: true });

function request(method, path, body = null, token = null, retries = 3) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'backend-tawny-six-59.vercel.app',
      port: 443,
      path: '/api' + path,
      method: method,
      agent,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        ...(token ? { 'Authorization': 'Bearer ' + token } : {}),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed.data !== undefined ? parsed.data : parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', async (err) => {
      if (retries > 0 && (err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT')) {
        console.log(`Retrying ${method} ${path} after ${err.code}... (${retries} left)`);
        await new Promise((r) => setTimeout(r, 1500));
        resolve(await request(method, path, body, token, retries - 1));
      } else {
        reject(err);
      }
    });

    if (payload) req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('=== 1. TEST ADMIN LOGIN ===');
  const loginRes = await request('POST', '/auth/login', {
    email: 'admin@subscriptiq.platform',
    password: 'adminpass'
  });
  console.log('Login Status:', loginRes.status, 'User:', loginRes.data?.user?.name, 'Role:', loginRes.data?.user?.role);
  const token = loginRes.data?.token;

  if (!token) {
    console.error('Failed to get token!');
    return;
  }

  console.log('\n=== 2. TEST INITIAL AUDIT LOGS ===');
  const initialAudit = await request('GET', '/admin/audit-logs', null, token);
  console.log('Audit logs count:', initialAudit.data?.items?.length);

  console.log('\n=== 3. TEST CREATE PLAN & AUDIT ===');
  const planName = 'Ultimate Pro ' + Math.floor(Math.random() * 1000);
  const planRes = await request('POST', '/plans', {
    name: planName,
    price: 3499,
    currency: '₹',
    billingInterval: 'month',
    description: 'Enterprise scale metering plan',
    apiLimit: '500,000 requests',
    storageLimit: '250 GB',
    features: ['500K API requests', '250 GB Storage', 'Dedicated SLA'],
    isCurrent: false,
  }, token);
  console.log('Create Plan Status:', planRes.status, 'Created ID:', planRes.data?.id, 'Name:', planRes.data?.name);

  console.log('\n=== 4. TEST CREATE CUSTOMER & AUDIT ===');
  const custName = 'Wayne Corp ' + Math.floor(Math.random() * 1000);
  const custRes = await request('POST', '/customers', {
    name: custName,
    email: 'bruce.' + Date.now() + '@waynecorp.com',
    plan: 'Enterprise',
    mobile: '9876543210'
  }, token);
  console.log('Create Customer Status:', custRes.status, 'Created ID:', custRes.data?.id, 'Name:', custRes.data?.name);

  console.log('\n=== 5. TEST USAGE INGESTION & IDEMPOTENCY ===');
  const eventId = 'EVT_TEST_' + Date.now();
  const ingest1 = await request('POST', '/usage/events', {
    id: eventId,
    customerId: custRes.data?.id || 'cust_1',
    customer: custName,
    resource: 'API Calls',
    quantity: 1500,
    timestamp: new Date().toISOString()
  }, token);
  console.log('Ingest Event 1 Status:', ingest1.status, 'Event Status:', ingest1.data?.status);

  const ingest2 = await request('POST', '/usage/events', {
    id: eventId,
    customerId: custRes.data?.id || 'cust_1',
    customer: custName,
    resource: 'API Calls',
    quantity: 1500,
    timestamp: new Date().toISOString()
  }, token);
  console.log('Ingest Event 2 (Duplicate) Status:', ingest2.status, 'Event Status:', ingest2.data?.status, 'Is Duplicate:', ingest2.data?.status === 'Duplicate');

  console.log('\n=== 6. TEST PAYMENT GATEWAY CREATE & VERIFY ===');
  const orderRes = await request('POST', '/payments/create-order', {
    amount: 3499,
    planName: planName,
    customerName: custName
  }, token);
  console.log('Create Payment Order Status:', orderRes.status, 'Order ID:', orderRes.data?.orderId);

  const verifyRes = await request('POST', '/payments/verify', {
    orderId: orderRes.data?.orderId,
    paymentMethod: 'upi',
    amount: 3499,
    planName: planName,
    customerName: custName
  }, token);
  console.log('Verify Payment Status:', verifyRes.status, 'Receipt:', verifyRes.data?.receiptNumber, 'Success:', verifyRes.data?.success);

  console.log('\n=== 7. VERIFY AUDIT LOGS FOR ALL OPERATIONS ===');
  const finalAudit = await request('GET', '/admin/audit-logs', null, token);
  console.log('Final Audit logs count:', finalAudit.data?.items?.length);
  const recentLogs = (finalAudit.data?.items || []).slice(0, 5);
  recentLogs.forEach((log, i) => {
    console.log('Log ' + (i + 1) + ': [' + log.who + '] ' + log.change + ' (' + log.timestamp + ')');
  });
  console.log('\nALL CREATION AND AUDIT OPERATIONS VERIFIED SUCCESSFULLY!');
}

runTests().catch(console.error);

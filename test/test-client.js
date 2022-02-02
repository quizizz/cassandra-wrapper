const Client  = require('..').Client;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function connectClient() {
  const contactPoints = ['54.242.206.48', '18.209.107.91', '3.95.39.29'];

  const client = new Client('testClient', 'quizizztest', 'us-east-1', { contactPoints });
  await client.connect();
  return client;
}

async function executeExample(client) {  
    const query = 'SELECT eid, name, joining_date, department FROM employees WHERE eid = ?';
    const params = ['10'];
  
    const result = await client.execute(query, params);
    console.log(result);
}

async function batchExecuteExample(client) {
    const queries = [
      'UPDATE employees SET name = \'rossUpdated\' WHERE eid = 11 and department = \'eng\'',
      'UPDATE employees SET name = \'kkhatriUpdated\' WHERE eid = 10 and department = \'eng\''
    ];
  
    const result = await client.batchExecute(queries);
    console.log(result);
}

async function runTests() {
  const client = await connectClient();
  await executeExample(client);
  await batchExecuteExample(client);
  process.exit(0);
}

runTests();
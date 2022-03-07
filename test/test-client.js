const Client  = require('..').Client;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function connectClient(contactPoints) {
  const clientName = 'testClient';
  const options = {
    contactPoints,
    keyspace: 'quizizztest',
    localDataCenter: 'us-east-1',
  };
  const client = new Client(clientName, null, options);
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

function randomNumber() {
  // returns 6 digit number
  return Math.floor(100000 + Math.random() * 900000);
}
async function concurrentExecuteExample(client) {
  const query = 'INSERT INTO employees (eid, department, joining_date, name) VALUES (?, ?, ?, ?)';
  const params = [
    [randomNumber(), 'sales', '2002-10-19', 'rk'],
    [randomNumber(), 'marketing', '2010-01-31', 'kate'],
    [randomNumber(), 'product', '2011-05-10', 'helen'],
    [randomNumber(), 'accounts', '2009-10-22', 'ann'],
  ];

  const result = await client.concurrentExecute(query, params);
  console.log(result);
}

async function runTests() {
  if (process.argv.length < 3) {
    console.log(
        'Please provide command line arguments to test cassandra client.\n' +
        'Expected arguments in order are: `contact-points`. Example....\n' + 
        'node test-client.js contact-points=1.2.3.4,4.5.6.7'
    );
    process.exit(1);
  }
  const args = process.argv.slice(2);
  const kwargs = {};
  const expectedKeywords = ['contact-points'];
  for (let arg of args) {
    const kwarg = arg.split('=');
    if (!expectedKeywords.includes(kwarg[0])) {
        console.log('Unexpected command line argument keyword. Only expected keywords are: ', expectedKeywords);
        process.exit(1);       
    }
    kwargs[kwarg[0]] = kwarg[1];
  }
  const contactPoints = kwargs['contact-points'].split(',');
  const client = await connectClient(contactPoints);
  await executeExample(client);
  await batchExecuteExample(client);
  await concurrentExecuteExample(client);
  await client.shutdown();
  process.exit(0);
}

runTests();
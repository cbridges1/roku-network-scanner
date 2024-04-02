require('dotenv').config();

const { networkInterfaces } = require('os');
const nets = networkInterfaces();

let addresses = ['192.168.0.1', '192.168.1.1', '192.168.1.254', '10.0.0.138', '192.168.2.1', '10.0.0.1', '10.0.0.2', '10.1.1.1', '192.168.1.10', '192.168.1.210', '192.168.1.99', '192.168.15.1', '192.168.16.1', '192.168.2.1'];
let workingAddress = '';

async function defineNetwork() {
  for (let i = 0; i < addresses.length; i++) {
    const currentIp = addresses[i];

    const status = await fetch(`http://${currentIp}`, {
      method: 'GET',
      signal: AbortSignal.timeout( 200 ),
    })
    .then(async (response) => {    
      return 'success';
    })
    .catch(function (err) {
      return 'failed';
    });

    if(status === 'success') {
      workingAddress = currentIp;
      console.log(workingAddress);
      break;
    }
  }
}

async function scanNetwork() {
  const base = workingAddress.substring(0, workingAddress.lastIndexOf('.'));
  const startIp = base + '.1';
  const endIp = base + '.254';

  for (let i = ipToNumber(startIp); i <= ipToNumber(endIp); i++) {
    const currentIp = numberToIp(i);

    await fetch(`http://${currentIp}:8060/query/device-info`, {
      method: 'GET',
      signal: AbortSignal.timeout( 200 ),
    })
    .then(async (response) => {
      const result = await fetch(`http://${currentIp}:8060/keypress/Up`, {
        method: 'POST',
      });

      console.log(currentIp);
      console.log(result.status);
    })
    .catch(function (err) {
      
    });
  }

  console.log('Interval complete.')
}

// Helper functions to convert between IP and number representations
function ipToNumber(ip) {
  return ip.split('.').reduce((acc, octet, index, array) => acc + parseInt(octet) * Math.pow(256, array.length - index - 1), 0);
}

function numberToIp(number) {
  return ((number >>> 24) & 0xFF) + '.' +
         ((number >>> 16) & 0xFF) + '.' +
         ((number >>> 8) & 0xFF) + '.' +
         (number & 0xFF);
}


const intervalInMinutes = process.env.INTERVAL_IN_MINUTES;
const intervalInMilliseconds = intervalInMinutes * 60 * 1000;

async function start() {
  await defineNetwork();
  await scanNetwork();
  
  const intervalId = setInterval(scanNetwork, intervalInMilliseconds);
}

start();
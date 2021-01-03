/* eslint-disable */
const request = require('got');

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// Define readiness function
async function checkReadiness() {
  const body = await request.get(`${process.env.GITLAB_URL}/-/readiness?all=1`).json();

  return body.master_check[0].status == 'ok';
}

async function checkLiveness() {
  const body = await request.get(`${process.env.GITLAB_URL}/-/liveness`).json();

  return body.status == 'ok';
}

// Poll GL for a successful readiness status
async function run() {
  let attempt = 0;

  await sleep(170000);

  while (attempt < 20) {
    try {
      const readinessSuccess = await checkReadiness();

      if (readinessSuccess) {
        const livenessSuccess = await checkLiveness();

        if (livenessSuccess) break;
      }
    } catch (e) {
      console.error(e.message);
    }

    await sleep(10000);

    attempt += 1;
  }

  await sleep(10000);
}

run();

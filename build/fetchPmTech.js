const base64 = require('base-64');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const sh = require('shelljs');
const { minify } = require('terser');
const requestOptions = {
  method: 'GET',
  headers: {
    bff: 'e2e'
  },
  redirect: 'follow'
};

async function compress(t) {
  const result = await minify(t, {});

  return result;
}

const host = process.env.WORKER || '';

const fetchPmTech = () => new Promise((resolve) => {
  fetch(host, requestOptions).then((resp) => {
    if (resp) {
      resp.json().then((data) => {
        const pmTech = JSON.parse(data.pmTech);
        const tag = pmTech['postman-docs'];
        const script = base64.decode(pmTech.version[tag]);

        compress(script).then((compressed) => {
          sh.exec('mkdir -p bff-data');
          sh.exec('touch bff-data/pmTech.js');

          fs.writeFile(
            path.join('bff-data', 'pmTech.js'),
            compressed.code,
            (er) => {
              if (er) {
                throw er;
              }
            },
          );

          resolve(compressed.code);
        });
      });
    }
  });
});

module.exports = fetchPmTech;

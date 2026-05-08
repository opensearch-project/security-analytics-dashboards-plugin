#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

const packageJsonPath = path.resolve(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

function parseInput(input) {
  const options = {};
  for (let i = 0; i < input.length; i++) {
    if (input[i].startsWith('--')) {
      const key = input[i].slice(2);
      const value =
        input[i + 1] && !input[i + 1].startsWith('--') ? input[i + 1] : true;
      options[key] = value;
      if (value !== true) i++;
    }
  }
  return options;
}

function wazuhUrl(filePath) {
  return `https://raw.githubusercontent.com/wazuh/wazuh/{branch}/${filePath}`;
}

function interpolate(template, variables) {
  return template.replace(/{(\w+)}/g, (_, key) => {
    return key in variables ? variables[key] : `{${key}}`;
  });
}

// Add entries here for each engine resource schema to fetch.
// Each entry can list multiple urls — they are tried in order until one succeeds.
// Use wazuhUrl() for version-tracked paths; add a hardcoded main URL as fallback
// for schemas that may not exist on the version branch yet.
const SCHEMA_SOURCES = [
  {
    name: 'wazuh-decoders',
    urls: [
      wazuhUrl('src/engine/ruleset/schemas/wazuh-decoders.json'),
    ],
  },
];

function fetchSchema(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          fetchSchema(res.headers.location).then(resolve).catch(reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} fetching ${url}`));
          return;
        }
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Failed to parse JSON from ${url}: ${e.message}`));
          }
        });
      })
      .on('error', (error) => {
        reject(new Error(`Failed to fetch ${url}: ${error.message}`));
      });
  });
}

async function fetchSchemaFromUrls(urls) {
  let lastError;
  for (const url of urls) {
    try {
      const schema = await fetchSchema(url);
      return { schema, url };
    } catch (error) {
      lastError = error;
      console.log(`  ⚠️  Failed to fetch from ${url}: ${error.message}`);
    }
  }
  throw lastError;
}

function saveOutput(location, data) {
  const dir = path.dirname(location);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(location, JSON.stringify(data, null, 2));
}

async function processSchema(sourceConfig, config) {
  console.log(`⚙️  Processing ${sourceConfig.name} schema...`);
  try {
    const urls = sourceConfig.urls.map((url) =>
      interpolate(url, { branch: config.branch }),
    );
    const { schema, url } = await fetchSchemaFromUrls(urls);
    console.log(`  ✅ Successfully fetched from: ${url}`);

    const outputPath = path.resolve(
      config.destination,
      `${sourceConfig.name}.schema.json`,
    );
    saveOutput(outputPath, schema);
    console.log(`  ✅ Written to ${outputPath}`);

    return schema;
  } catch (error) {
    console.error(`  ❌ Error processing ${sourceConfig.name}: ${error.message}`);
    throw error;
  }
}

async function main(config) {
  console.log(`📦 Using Wazuh version: ${config.branch}`);

  for (const source of SCHEMA_SOURCES) {
    await processSchema(source, config);
  }

  console.log('\n✨ Schema generation completed!');
}

if (require.main === module) {
  const config = parseInput(process.argv.slice(2));
  config.branch = config.branch || packageJson.wazuh?.version;
  config.destination = path.resolve(
    config.destination || path.resolve(__dirname, '..', 'common', 'schemas'),
  );

  main(config).catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
}

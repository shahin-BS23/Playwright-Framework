const fs = require('fs');
const path = require('path');
const libCoverage = require('istanbul-lib-coverage');
const libReport = require('istanbul-lib-report');
const reports = require('istanbul-reports');

const COVERAGE_DIR = path.resolve('coverage');

function loadChunks() {
  const files = fs.existsSync(COVERAGE_DIR)
    ? fs.readdirSync(COVERAGE_DIR).filter(f => f.endsWith('.json'))
    : [];
  const all = [];
  for (const f of files) {
    const data = JSON.parse(fs.readFileSync(path.join(COVERAGE_DIR, f), 'utf-8'));
    all.push(...data);
  }
  return all;
}

function toCoverageMap(chunks) {
  const map = libCoverage.createCoverageMap({});
  for (const fc of chunks) {
    const fileCov = libCoverage.createFileCoverage(fc);
    map.merge(libCoverage.createCoverageMap({ [fileCov.file]: fileCov.toJSON() }));
  }
  return map;
}

(function main() {
  if (!fs.existsSync(COVERAGE_DIR)) {
    console.error('No coverage directory found. Run tests with ENABLE_COVERAGE=true first.');
    process.exit(1);
  }
  const chunks = loadChunks();
  if (chunks.length === 0) {
    console.error('No coverage JSON chunks found in coverage/.');
    process.exit(1);
  }

  const map = toCoverageMap(chunks);
  const outDir = path.join(COVERAGE_DIR, 'html');
  const context = libReport.createContext({
    dir: outDir,
    defaultSummarizer: 'nested',
    coverageMap: map
  });

  reports.create('html').execute(context);
  reports.create('text-summary').execute(context);

  console.log(`HTML coverage report written to ${path.join(outDir, 'index.html')}`);
})();



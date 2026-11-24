/**
 * Script chay tu dong toan bo bo kiem thu Postman Collection trong docs/KiemthuAPI/
 * Cach chay:
 *   cd backend
 *   npm test
 *   (Hoac chay 1 file cu the: node src/tests/runPostmanCollections.js WEBQUANLYMUONSACH_KHOANPHAT.postman_collection.json)
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const http = require('http');
const assert = require('assert');
const mongoose = require('mongoose');
const app = require('../app');
const {
  TaiKhoan,
  DocGia,
  Sach,
  PhieuMuon,
  KhoanPhat,
  NhatKyHeThong,
} = require('../models');

/**
 * Tao doi tuong pm.expect tuong thich voi Chai/Postman assertions trong cac file collection
 */
function createExpect(actual) {
  const api = {
    to: {
      be: {
        get true() {
          assert.strictEqual(actual, true, `Expected true but got ${actual}`);
          return true;
        },
        get false() {
          assert.strictEqual(actual, false, `Expected false but got ${actual}`);
          return true;
        },
        get null() {
          assert.strictEqual(actual, null, `Expected null but got ${actual}`);
          return true;
        },
        a(type) {
          return api.to.be.an(type);
        },
        an(type) {
          const t = type.toLowerCase();
          if (t === 'array') {
            assert.ok(Array.isArray(actual), `Expected array but got ${typeof actual}`);
          } else if (t === 'object') {
            assert.ok(
              actual !== null && typeof actual === 'object' && !Array.isArray(actual),
              `Expected object but got ${actual}`
            );
          } else {
            assert.strictEqual(typeof actual, t, `Expected type ${t} but got ${typeof actual}`);
          }
        },
        above(n) {
          assert.ok(
            typeof actual === 'number' && actual > n,
            `Expected ${actual} to be above ${n}`
          );
        },
      },
      eql(expected) {
        assert.deepStrictEqual(
          actual,
          expected,
          `Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`
        );
      },
      match(regex) {
        assert.ok(regex.test(String(actual)), `Expected '${actual}' to match ${regex}`);
      },
    },
  };
  return api;
}

/**
 * Thay the bien {{varName}} va {{$timestamp}} / {{$randomInt}} trong chuoi
 */
function interpolate(str, vars) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/\{\{\$timestamp\}\}/g, () => String(Date.now()))
    .replace(/\{\{\$randomInt\}\}/g, () => String(Math.floor(Math.random() * 900) + 100))
    .replace(/\{\{([^}]+)\}\}/g, (_, key) => {
      const trimmed = key.trim();
      return vars.has(trimmed) ? String(vars.get(trimmed)) : `{{${trimmed}}}`;
    });
}

/**
 * Goi HTTP request
 */
function sendHttpRequest({ method, url, headers, body }) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const reqOptions = {
      method: method || 'GET',
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      headers: headers || {},
    };

    const req = http.request(reqOptions, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const rawBody = Buffer.concat(chunks).toString('utf8');
        let jsonBody = null;
        try {
          jsonBody = JSON.parse(rawBody);
        } catch (_) {
          // ignore
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          rawBody,
          jsonBody,
        });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(body);
    }
    req.end();
  });
}

/**
 * Chay 1 file Postman Collection
 */
async function runCollectionFile(filePath, baseUrlOverride) {
  const collection = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const vars = new Map();

  if (Array.isArray(collection.variable)) {
    for (const v of collection.variable) {
      vars.set(v.key, v.value);
    }
  }
  if (baseUrlOverride) {
    vars.set('baseUrl', baseUrlOverride);
  }

  console.log(`\n======================================================================`);
  console.log(`CHAY COLLECTION: ${collection.info.name}`);
  console.log(`File: ${path.basename(filePath)}`);
  console.log(`======================================================================`);

  let passedTests = 0;
  let failedTests = 0;

  for (const item of collection.item) {
    const events = Array.isArray(item.event) ? item.event : [];
    const prereqEvent = events.find((e) => e.listen === 'prerequest');
    const testEvent = events.find((e) => e.listen === 'test');

    const pmBase = {
      collectionVariables: {
        get: (k) => vars.get(k),
        set: (k, v) => vars.set(k, String(v)),
      },
    };

    if (prereqEvent && prereqEvent.script && Array.isArray(prereqEvent.script.exec)) {
      const code = prereqEvent.script.exec.join('\n');
      const fn = new Function('pm', code);
      fn(pmBase);
    }

    const rawUrl =
      typeof item.request.url === 'string'
        ? item.request.url
        : item.request.url.raw;
    const url = interpolate(rawUrl, vars);

    const headers = {};
    if (Array.isArray(item.request.header)) {
      for (const h of item.request.header) {
        if (!h.disabled) {
          headers[h.key] = interpolate(h.value, vars);
        }
      }
    }

    let body = null;
    if (item.request.body && item.request.body.mode === 'raw') {
      body = interpolate(item.request.body.raw, vars);
    }

    const response = await sendHttpRequest({
      method: item.request.method,
      url,
      headers,
      body,
    });

    const itemAssertions = [];
    const pmTest = {
      ...pmBase,
      expect: createExpect,
      response: {
        code: response.status,
        json: () => response.jsonBody,
        to: {
          have: {
            status: (expectedCode) => {
              assert.strictEqual(
                response.status,
                expectedCode,
                `Expected HTTP ${expectedCode} but got ${response.status} (Response: ${response.rawBody})`
              );
            },
          },
        },
      },
      test: (testName, callback) => {
        try {
          callback();
          itemAssertions.push({ name: testName, passed: true });
          passedTests++;
        } catch (err) {
          itemAssertions.push({ name: testName, passed: false, error: err.message });
          failedTests++;
        }
      },
    };

    if (testEvent && testEvent.script && Array.isArray(testEvent.script.exec)) {
      const code = testEvent.script.exec.join('\n');
      try {
        const fn = new Function('pm', code);
        fn(pmTest);
      } catch (scriptErr) {
        itemAssertions.push({
          name: 'Runtime Script Execution',
          passed: false,
          error: scriptErr.message,
        });
        failedTests++;
      }
    }

    const allPassed = itemAssertions.every((a) => a.passed);
    console.log(
      `${allPassed ? '[PASS]' : '[FAIL]'} ${item.name} -> HTTP ${response.status}`
    );
    for (const a of itemAssertions) {
      if (!a.passed) {
        console.error(`   x ${a.name}: ${a.error}`);
      }
    }
  }

  return { passedTests, failedTests };
}

/**
 * Don dep du lieu tam sinh ra trong qua trinh chay bo test MuonTra & KhoanPhat
 */
async function cleanupAutoTestData() {
  const dsTkTest = await TaiKhoan.find({
    tenDangNhap: /^(dg_muontra_|dg_phat_|dg_autotest_|nv_autotest_)/,
  }).lean();
  const tkIds = dsTkTest.map((t) => t._id);

  if (tkIds.length > 0) {
    const dsDocGiaTest = await DocGia.find({ taiKhoanId: { $in: tkIds } }).lean();
    const dgIds = dsDocGiaTest.map((d) => d._id);

    if (dgIds.length > 0) {
      const dsPhieu = await PhieuMuon.find({ docGiaId: { $in: dgIds } }).lean();
      const phieuIds = dsPhieu.map((p) => p._id);

      await KhoanPhat.deleteMany({ docGiaId: { $in: dgIds } });
      await PhieuMuon.deleteMany({ docGiaId: { $in: dgIds } });
      await NhatKyHeThong.deleteMany({
        $or: [
          { doiTuongId: { $in: [...dgIds, ...phieuIds, ...tkIds] } },
          { nguoiThucHienId: { $in: tkIds } },
        ],
      });
      await DocGia.deleteMany({ _id: { $in: dgIds } });
    }
    await TaiKhoan.deleteMany({ _id: { $in: tkIds } });
  }

  await Sach.deleteMany({
    tenSach: /^(Sach Test Muon Tra |Sach Test Phat |Sach Het Kho AutoTest |Cau Truc Du Lieu AutoTest )/,
  });
}

async function main() {
  const mongoUri =
    process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/webquanlymuonsach';

  await mongoose.connect(mongoUri);
  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });

  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api`;

  const kiemThuDir = path.resolve(__dirname, '../../../docs/KiemthuAPI');
  const filterArg = process.argv[2];

  const allFiles = [
    'WEBQUANLYMUONSACH_NXB_CRUD.postman_collection.json',
    'WEBQUANLYMUONSACH_SACH_CRUD.postman_collection.json',
    'WEBQUANLYMUONSACH_DOCGIA_CRUD.postman_collection.json',
    'WEBQUANLYMUONSACH_NHANVIEN_CRUD.postman_collection.json',
    'WEBQUANLYMUONSACH_MUONTRA.postman_collection.json',
    'WEBQUANLYMUONSACH_KHOANPHAT.postman_collection.json',
  ].filter((f) => !filterArg || f.toLowerCase().includes(filterArg.toLowerCase()));

  let totalPassed = 0;
  let totalFailed = 0;

  try {
    for (const fileName of allFiles) {
      const fullPath = path.join(kiemThuDir, fileName);
      if (fs.existsSync(fullPath)) {
        const { passedTests, failedTests } = await runCollectionFile(
          fullPath,
          baseUrl
        );
        totalPassed += passedTests;
        totalFailed += failedTests;
      }
    }
  } finally {
    await cleanupAutoTestData();
    await new Promise((resolve) => server.close(resolve));
    await mongoose.disconnect();
  }

  console.log(`\n======================================================================`);
  console.log(`TONG KET KIEM THU TU DONG: ${totalPassed} PASSED | ${totalFailed} FAILED`);
  console.log(`======================================================================\n`);

  if (totalFailed > 0) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('[LOI CHAY KIEM THU]:', err);
  process.exitCode = 1;
});

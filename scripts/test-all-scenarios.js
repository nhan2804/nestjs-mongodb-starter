const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const BASE_URL = 'http://127.0.0.1:4002/v1/api';

async function runTests() {
  console.log('=== STARTING COMPLETE INTEGRATION TESTS ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Authentication
  console.log('1. Testing Authentication...');
  let token = '';
  try {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin@gmail.com',
      password: 'admin@gmail.com',
    });
    token = res.data.access_token;
    assert(!!token, 'Login successful and access_token received');
  } catch (err) {
    assert(false, `Login failed: ${err.response?.data?.message || err.message}`);
    return;
  }

  const api = axios.create({
    baseURL: BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
  });

  // 2. Exam Session Management
  console.log('\n2. Testing Exam Session Management...');
  let sessionId = '';
  try {
    const sessionRes = await api.post('/exam-sessions', {
      name: 'Khám sơ tuyển NVQS 2025 Test',
      year: 2025,
      phase: 'preliminary',
      serviceType: 'military',
      description: 'Phiên khám kiểm thử tự động',
    });
    sessionId = sessionRes.data._id;
    assert(!!sessionId, `Created session with ID: ${sessionId}`);

    // Activate session
    const activateRes = await api.patch(`/exam-sessions/${sessionId}/activate`);
    assert(activateRes.data.isActive === true, 'Session successfully activated');
  } catch (err) {
    assert(false, `Session management failed: ${err.response?.data?.message || err.message}`);
  }

  // 3. Citizen JSON Import & Preview
  console.log('\n3. Testing Citizen JSON Import & Validation...');
  const sampleImportData = [
    {
      rawVillage: 'Phú Yên',
      index: 879,
      fullName: 'Nguyễn Tiến Lợi',
      birthDate: '06/05/2006',
      CCCD: '049206007063',
      address: 'Phú Yên - Chiên Đàn',
      carrer: 'Sinh viên',
      workplace: 'Không',
      village: 'Phú Yên',
      day: 22,
      note: 'Nhận lệnh gián tiếp 22/10',
      idx: 156,
      status: { trang_thai_nhan_lenh: 'Gián tiếp' },
    },
    {
      rawVillage: 'Thạnh Đức',
      index: 880,
      fullName: 'Trần Văn An',
      birthDate: '15/08/2005',
      CCCD: '049205001234',
      address: 'Thạnh Đức',
      carrer: 'Lao động tự do',
      village: 'Thạnh Đức',
      day: 23,
      idx: 157,
    },
    // Invalid CCCD record to test rejection
    {
      rawVillage: 'Phú Yên',
      fullName: 'Người Lỗi CCCD',
      CCCD: '12345', // invalid: only 5 digits
      day: 22,
    },
  ];

  try {
    // 3.1 Preview Import
    const previewRes = await api.post('/citizens/import/preview', {
      sessionId,
      year: 2025,
      month: 10,
      records: sampleImportData,
    });
    assert(previewRes.data.totalRows === 3, 'Preview reported 3 total rows');
    assert(previewRes.data.validCount === 2, 'Preview reported 2 valid rows');
    assert(previewRes.data.invalidCount === 1, 'Preview correctly rejected 1 invalid CCCD row');
    assert(previewRes.data.invalidRows[0].error.includes('12 chữ số'), 'Invalid row error message correctly mentions 12 digits');

    // 3.2 Execute Import
    const importRes = await api.post('/citizens/import', {
      sessionId,
      year: 2025,
      month: 10,
      records: sampleImportData,
    });
    const totalUpserted = (importRes.data.importedCitizens || 0) + (importRes.data.updatedCitizens || 0);
    assert(totalUpserted === 2, `Upserted 2 valid citizens into MongoDB (new: ${importRes.data.importedCitizens}, updated: ${importRes.data.updatedCitizens})`);
    assert(importRes.data.createdRecords === 2, 'Created 2 exam records for session');

    // 3.3 Idempotent re-import
    const reimportRes = await api.post('/citizens/import', {
      sessionId,
      year: 2025,
      month: 10,
      records: sampleImportData,
    });
    assert(reimportRes.data.createdRecords === 0, 'Re-import created 0 duplicate exam records');
    assert(reimportRes.data.preservedRecords === 2, 'Re-import safely preserved existing exam records');
  } catch (err) {
    assert(false, `Import failed: ${err.response?.data?.message || err.message}`);
  }

  // 4. Attendance Management
  console.log('\n4. Testing Attendance Management...');
  let recordId = '';
  try {
    const listRes = await api.get(`/exam-records?sessionId=${sessionId}`);
    assert(listRes.data.data.length === 2, 'Found 2 exam records in session');
    const targetRecord = listRes.data.data.find((r) => r.citizenId === '049206007063');
    recordId = targetRecord._id;

    // Check in
    const checkInRes = await api.patch(`/exam-records/${recordId}/attendance`, { arrived: true });
    assert(checkInRes.data.attendance.arrived === true, 'Attendance marked as arrived: true');
    const firstCheckInTime = checkInRes.data.attendance.arrivedAt;
    assert(!!firstCheckInTime, `Server-generated check-in timestamp recorded: ${firstCheckInTime}`);

    // Repeat check-in (must NOT overwrite original timestamp)
    await new Promise((r) => setTimeout(r, 1000));
    const repeatRes = await api.patch(`/exam-records/${recordId}/attendance`, { arrived: true });
    assert(
      repeatRes.data.attendance.arrivedAt === firstCheckInTime,
      'Repeated check-in safely preserved original arrivedAt timestamp'
    );

    // Undo check in
    const undoRes = await api.patch(`/exam-records/${recordId}/attendance`, { arrived: false });
    assert(undoRes.data.attendance.arrived === false, 'Undo check-in successfully reset arrived to false');

    // Re-check in for subsequent tests
    const reCheckInRes = await api.patch(`/exam-records/${recordId}/attendance`, { arrived: true });
    assert(reCheckInRes.data.attendance.arrived === true, 'Re-checked in citizen');

    // Update Note
    const noteRes = await api.patch(`/exam-records/${recordId}/note`, {
      note: 'Công dân sức khỏe loại 1, mắt 10/10',
    });
    assert(noteRes.data.note === 'Công dân sức khỏe loại 1, mắt 10/10', 'Examination note updated successfully');
  } catch (err) {
    assert(false, `Attendance failed: ${err.response?.data?.message || err.message}`);
  }

  // 5. Local Photo Storage, Sharp Processing & Trash Management
  console.log('\n5. Testing Local Photo Storage & Trash Management...');
  let photo1Id = '';
  let photo2Id = '';
  try {
    // Generate a valid 100x100 JPEG buffer with Sharp
    const sharp = require('sharp');
    const validJpeg = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 3,
        background: { r: 255, g: 0, b: 0 },
      },
    })
      .jpeg()
      .toBuffer();

    // Upload Photo 1
    const form1 = new FormData();
    form1.append('file', validJpeg, { filename: 'avatar1.jpg', contentType: 'image/jpeg' });
    const upload1Res = await api.post(`/exam-records/${recordId}/photos`, form1, {
      headers: form1.getHeaders(),
    });
    photo1Id = upload1Res.data.photo.id;
    assert(!!photo1Id, `Uploaded photo 1 with ID: ${photo1Id}`);
    assert(upload1Res.data.photo.isPrimary === true, 'First uploaded photo automatically marked as isPrimary: true');

    const storageRoot = process.env.PHOTO_STORAGE_ROOT ? path.resolve(process.env.PHOTO_STORAGE_ROOT) : path.resolve('..', 'storage');

    // Verify file exists on local filesystem
    const expectedUpload1Path = path.resolve(storageRoot, upload1Res.data.photo.path);
    assert(fs.existsSync(expectedUpload1Path), `Photo 1 physically saved on disk at: ${expectedUpload1Path}`);

    // Upload Photo 2
    const form2 = new FormData();
    form2.append('file', validJpeg, { filename: 'avatar2.jpg', contentType: 'image/jpeg' });
    const upload2Res = await api.post(`/exam-records/${recordId}/photos`, form2, {
      headers: form2.getHeaders(),
    });
    photo2Id = upload2Res.data.photo.id;
    assert(upload2Res.data.photo.isPrimary === false, 'Second photo uploaded as isPrimary: false');

    // Set Photo 2 as Primary
    const primaryRes = await api.patch(`/exam-records/${recordId}/photos/${photo2Id}/primary`);
    const p2 = primaryRes.data.photos.find((p) => p.id === photo2Id);
    const p1 = primaryRes.data.photos.find((p) => p.id === photo1Id);
    assert(p2.isPrimary === true && p1.isPrimary === false, 'Photo 2 successfully set as primary, Photo 1 unset');

    // Delete Photo 1 (moves to trash)
    const deleteRes = await api.delete(`/exam-records/${recordId}/photos/${photo1Id}`);
    const deletedPhotoMeta = deleteRes.data.photos.find((p) => p.id === photo1Id);
    assert(!!deletedPhotoMeta.deletedAt, 'Photo 1 metadata marked with deletedAt timestamp');

    const expectedTrash1Path = path.resolve(storageRoot, deletedPhotoMeta.trashPath);
    assert(fs.existsSync(expectedTrash1Path), `Photo 1 physically moved to trash folder on disk: ${expectedTrash1Path}`);
    assert(!fs.existsSync(expectedUpload1Path), 'Photo 1 no longer present in uploads folder');

    // Verify deleted photo does not appear in active photo list
    const recordDetailRes = await api.get(`/exam-records/${recordId}`);
    assert(
      recordDetailRes.data.activePhotos.length === 1 && recordDetailRes.data.activePhotos[0].id === photo2Id,
      'Deleted photo excluded from activePhotos gallery'
    );

    // Restore Photo 1 from trash
    const restoreRes = await api.post(`/exam-records/${recordId}/photos/${photo1Id}/restore`);
    const restoredMeta = restoreRes.data.photos.find((p) => p.id === photo1Id);
    assert(restoredMeta.deletedAt === null, 'Photo 1 deletedAt cleared upon restoration');
    assert(fs.existsSync(expectedUpload1Path), 'Photo 1 physically restored to uploads folder on disk');

    // Re-verify active photos count
    const recordDetailAfterRestore = await api.get(`/exam-records/${recordId}`);
    assert(recordDetailAfterRestore.data.activePhotos.length === 2, 'Restored photo returned to active gallery (count = 2)');
  } catch (err) {
    assert(false, `Photo operations failed: ${err.response?.data?.message || err.message}`);
  }

  // 6. Data Integrity after Re-Import
  console.log('\n6. Testing Data Integrity Preservation after Re-Import...');
  try {
    await api.post('/citizens/import', {
      sessionId,
      year: 2025,
      month: 10,
      records: sampleImportData,
    });
    const recordCheck = await api.get(`/exam-records/${recordId}`);
    assert(recordCheck.data.attendance.arrived === true, 'Attendance PRESERVED after re-import');
    assert(recordCheck.data.note === 'Công dân sức khỏe loại 1, mắt 10/10', 'Examination note PRESERVED after re-import');
    assert(recordCheck.data.activePhotos.length === 2, 'Photos PRESERVED after re-import');
  } catch (err) {
    assert(false, `Data integrity check failed: ${err.response?.data?.message || err.message}`);
  }

  // 7. Summary & Filtering & Vietnamese Search
  console.log('\n7. Testing Summary & Accent-Insensitive Vietnamese Search...');
  try {
    // Summary
    const summaryRes = await api.get(`/exam-records/summary?sessionId=${sessionId}`);
    assert(summaryRes.data.totalCitizens === 2, 'Summary totalCitizens is 2');
    assert(summaryRes.data.arrivedCount === 1, 'Summary arrivedCount is 1');
    assert(summaryRes.data.photographedCount === 1, 'Summary photographedCount is 1');
    assert(summaryRes.data.distinctDates.includes('2025-10-22'), 'Summary distinctDates includes 2025-10-22');
    assert(summaryRes.data.distinctVillages.includes('Phú Yên'), 'Summary distinctVillages includes Phú Yên');

    // Accent-insensitive search
    const searchRes = await api.get(`/exam-records?sessionId=${sessionId}&search=Nguyen Tien Loi`);
    assert(
      searchRes.data.data.length === 1 && searchRes.data.data[0].citizen.fullName === 'Nguyễn Tiến Lợi',
      'Accent-free search "Nguyen Tien Loi" successfully matched "Nguyễn Tiến Lợi"'
    );

    // Search by CCCD
    const searchCCCDRes = await api.get(`/exam-records?sessionId=${sessionId}&search=049206007063`);
    assert(searchCCCDRes.data.data.length === 1, 'Search by CCCD "049206007063" matched correctly');
  } catch (err) {
    assert(false, `Search & summary failed: ${err.response?.data?.message || err.message}`);
  }

  // 8. Audit Logs Verification
  console.log('\n8. Testing Audit Logs...');
  try {
    const auditRes = await api.get(`/audit-logs?entityId=${recordId}`);
    const actions = auditRes.data.data.map((l) => l.action);
    assert(actions.includes('attendance.check_in'), 'Audit log contains attendance.check_in');
    assert(actions.includes('attendance.undo'), 'Audit log contains attendance.undo');
    assert(actions.includes('record.note_update'), 'Audit log contains record.note_update');
    assert(actions.includes('photo.upload'), 'Audit log contains photo.upload');
    assert(actions.includes('photo.delete'), 'Audit log contains photo.delete');
    assert(actions.includes('photo.restore'), 'Audit log contains photo.restore');
    assert(actions.includes('photo.set_primary'), 'Audit log contains photo.set_primary');
  } catch (err) {
    assert(false, `Audit log check failed: ${err.response?.data?.message || err.message}`);
  }

  console.log(`\n=== TEST RESULTS: ${passed} PASSED, ${failed} FAILED ===\n`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error(e);
  process.exit(1);
});

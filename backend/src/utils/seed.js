/**
 * Script seed du lieu mau cho he thong WEBQUANLYMUONSACH
 * Chay bang lenh: npm run seed (trong thu muc backend)
 * Co tinh idempotent (chay lai nhieu lan khong loi duplicate key)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const {
  TaiKhoan,
  DocGia,
  NhanVien,
  NhaXuatBan,
  Sach,
  CauHinhThuVien,
} = require('../models');

const {
  VAI_TRO,
  TRANG_THAI_TAI_KHOAN,
  PHAI,
  TRANG_THAI_QUYEN_MUON,
  TRANG_THAI_HO_SO_DOC_GIA,
  TRANG_THAI_LAM_VIEC,
  TRANG_THAI_NXB,
  TRANG_THAI_LUU_THONG_SACH,
  CACH_CAP_TAI_KHOAN_DOC_GIA,
  MA_CAU_HINH,
} = require('../constants/enums');

const SALT_ROUNDS = 10;

async function taoHoacLayTaiKhoan({ tenDangNhap, email, matKhau, vaiTro, trangThai }) {
  let taiKhoan = await TaiKhoan.findOne({ tenDangNhap });
  const matKhauHash = await bcrypt.hash(matKhau, SALT_ROUNDS);

  if (!taiKhoan) {
    taiKhoan = await TaiKhoan.create({
      tenDangNhap,
      email,
      matKhauHash,
      vaiTro,
      trangThai: trangThai || TRANG_THAI_TAI_KHOAN.HOAT_DONG,
    });
    console.log(`[TAO MOI] Tai khoan: ${tenDangNhap} (${vaiTro})`);
  } else {
    taiKhoan.matKhauHash = matKhauHash;
    taiKhoan.vaiTro = vaiTro;
    taiKhoan.trangThai = trangThai || TRANG_THAI_TAI_KHOAN.HOAT_DONG;
    await taiKhoan.save();
    console.log(`[CAP NHAT MAT KHAU SEED] Tai khoan: ${tenDangNhap} (${vaiTro})`);
  }

  return taiKhoan;
}

async function seedDatabase() {
  const mongoUri =
    process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/webquanlymuonsach';

  console.log(`Dang ket noi MongoDB: ${mongoUri} ...`);
  await mongoose.connect(mongoUri);
  console.log('Ket noi MongoDB thanh cong!\n');

  // 1. Seed cau_hinh_thu_vien
  await CauHinhThuVien.findOneAndUpdate(
    { maCauHinh: MA_CAU_HINH.MAC_DINH },
    {
      $setOnInsert: {
        maCauHinh: MA_CAU_HINH.MAC_DINH,
        soNgayMuonMacDinh: 14, // PENDING DECISION
        soSachMuonToiDa: 5, // PENDING DECISION
        tienPhatTraTreMoiNgay: 2000, // PENDING DECISION
        soLanGiaHanToiDa: 1, // PENDING DECISION
        soNgayGiaHanMoiLan: null, // PENDING DECISION
        hanCheMuonKhiCoViPham: true, // PENDING DECISION
        choPhepDatTruoc: false, // PENDING DECISION
        cachCapTaiKhoanDocGia: CACH_CAP_TAI_KHOAN_DOC_GIA.TU_DANG_KY_VA_NHAN_VIEN_TAO, // PENDING DECISION
        yeuCauXacMinhTaiKhoanDocGia: false, // PENDING DECISION
        yeuCauDienThoaiDuyNhat: true, // PENDING DECISION
        soNgayNhacTraTruocHan: null, // PENDING DECISION
        nguongSoNgayQuaHanKhoaMuon: null, // PENDING DECISION
        tyLeBoiThuongSachMat: null, // PENDING DECISION
        tyLeBoiThuongSachHuHong: null, // PENDING DECISION
        nguoiCapNhatId: null,
      },
    },
    { upsert: true, returnDocument: 'after' }
  );
  console.log('[OK] Cau hinh thu vien mac dinh (MAC_DINH)');

  // 2. Seed Tai khoan & Ho so Quan tri vien (QUAN_TRI)
  const tkAdmin = await taoHoacLayTaiKhoan({
    tenDangNhap: 'admin',
    email: 'admin@thuviendhct.edu.vn',
    matKhau: 'Admin@123',
    vaiTro: VAI_TRO.QUAN_TRI,
    trangThai: TRANG_THAI_TAI_KHOAN.HOAT_DONG,
  });

  await NhanVien.findOneAndUpdate(
    { $or: [{ taiKhoanId: tkAdmin._id }, { msnv: 'NV0001' }] },
    {
      $set: {
        taiKhoanId: tkAdmin._id,
        msnv: 'NV0001',
      },
      $setOnInsert: {
        hoTenNV: 'Nguyen Quan Tri',
        chucVu: 'Quan tri vien he thong',
        diaChi: 'Khu II, Duong 3/2, Ninh Kieu, Can Tho',
        soDienThoai: '0901000001',
        trangThaiLamViec: TRANG_THAI_LAM_VIEC.DANG_LAM_VIEC,
        nguoiTaoId: tkAdmin._id,
        nguoiCapNhatId: tkAdmin._id,
      },
    },
    { upsert: true, returnDocument: 'after' }
  );
  console.log('[OK] Ho so Nhan vien Admin (msnv: NV0001)');

  // 3. Seed Tai khoan & Ho so Thu thu (THU_THU)
  const tkThuThu = await taoHoacLayTaiKhoan({
    tenDangNhap: 'thuthu',
    email: 'thuthu@thuviendhct.edu.vn',
    matKhau: 'ThuThu@123',
    vaiTro: VAI_TRO.THU_THU,
    trangThai: TRANG_THAI_TAI_KHOAN.HOAT_DONG,
  });

  await NhanVien.findOneAndUpdate(
    { $or: [{ taiKhoanId: tkThuThu._id }, { msnv: 'NV0002' }] },
    {
      $set: {
        taiKhoanId: tkThuThu._id,
        msnv: 'NV0002',
      },
      $setOnInsert: {
        hoTenNV: 'Tran Thi Thu Thu',
        chucVu: 'Thu thu',
        diaChi: 'Quan Ninh Kieu, TP. Can Tho',
        soDienThoai: '0901000002',
        trangThaiLamViec: TRANG_THAI_LAM_VIEC.DANG_LAM_VIEC,
        nguoiTaoId: tkAdmin._id,
        nguoiCapNhatId: tkAdmin._id,
      },
    },
    { upsert: true, returnDocument: 'after' }
  );
  console.log('[OK] Ho so Nhan vien Thu thu (msnv: NV0002)');

  // 4. Seed Tai khoan & Ho so Doc gia (DOC_GIA)
  const tkDocGia1 = await taoHoacLayTaiKhoan({
    tenDangNhap: 'docgia01',
    email: 'docgia01@student.ctu.edu.vn',
    matKhau: 'DocGia@123',
    vaiTro: VAI_TRO.DOC_GIA,
    trangThai: TRANG_THAI_TAI_KHOAN.HOAT_DONG,
  });

  await DocGia.findOneAndUpdate(
    { $or: [{ taiKhoanId: tkDocGia1._id }, { maDocGia: 'DG0001' }] },
    {
      $set: {
        taiKhoanId: tkDocGia1._id,
        maDocGia: 'DG0001',
      },
      $setOnInsert: {
        hoLot: 'Le Van',
        ten: 'An',
        ngaySinh: new Date('2005-05-15'),
        phai: PHAI.NAM,
        diaChi: 'Ky tuc xa B, Dai hoc Can Tho',
        dienThoai: '0912000001',
        trangThaiQuyenMuon: TRANG_THAI_QUYEN_MUON.DUOC_MUON,
        soSachDangMuon: 0,
        tongTienPhatChuaTra: 0,
        trangThaiHoSo: TRANG_THAI_HO_SO_DOC_GIA.HOAT_DONG,
        nguoiTaoId: tkThuThu._id,
        nguoiCapNhatId: tkThuThu._id,
      },
    },
    { upsert: true, returnDocument: 'after' }
  );
  console.log('[OK] Ho so Doc gia 1 (maDocGia: DG0001 - DUOC_MUON)');

  const tkDocGia2 = await taoHoacLayTaiKhoan({
    tenDangNhap: 'docgia02',
    email: 'docgia02@student.ctu.edu.vn',
    matKhau: 'DocGia@123',
    vaiTro: VAI_TRO.DOC_GIA,
    trangThai: TRANG_THAI_TAI_KHOAN.HOAT_DONG,
  });

  await DocGia.findOneAndUpdate(
    { $or: [{ taiKhoanId: tkDocGia2._id }, { maDocGia: 'DG0002' }] },
    {
      $set: {
        taiKhoanId: tkDocGia2._id,
        maDocGia: 'DG0002',
      },
      $setOnInsert: {
        hoLot: 'Pham Thi',
        ten: 'Binh',
        ngaySinh: new Date('2005-08-20'),
        phai: PHAI.NU,
        diaChi: 'Phuong Xuan Khanh, Ninh Kieu, Can Tho',
        dienThoai: '0912000002',
        trangThaiQuyenMuon: TRANG_THAI_QUYEN_MUON.BI_HAN_CHE,
        lyDoHanCheMuon: 'Dang co sach qua han chua tra (du lieu mau test BR-04)',
        soSachDangMuon: 0,
        tongTienPhatChuaTra: 0,
        trangThaiHoSo: TRANG_THAI_HO_SO_DOC_GIA.HOAT_DONG,
        nguoiTaoId: tkThuThu._id,
        nguoiCapNhatId: tkThuThu._id,
      },
    },
    { upsert: true, returnDocument: 'after' }
  );
  console.log('[OK] Ho so Doc gia 2 (maDocGia: DG0002 - BI_HAN_CHE)');

  // 5. Seed Nha xuat ban (nha_xuat_ban)
  const danhSachNXBMau = [
    {
      maNXB: 'NXB001',
      tenNXB: 'Nha xuat ban Tre',
      diaChi: '161B Ly Chinh Thang, Quan 3, TP. Ho Chi Minh',
    },
    {
      maNXB: 'NXB002',
      tenNXB: 'Nha xuat ban Kim Dong',
      diaChi: '55 Quang Trung, Hai Ba Trung, Ha Noi',
    },
    {
      maNXB: 'NXB003',
      tenNXB: 'Nha xuat ban Giao Duc Viet Nam',
      diaChi: '81 Tran Hung Dao, Hoan Kiem, Ha Noi',
    },
  ];

  const mapNXB = {};
  for (const item of danhSachNXBMau) {
    const nxb = await NhaXuatBan.findOneAndUpdate(
      { maNXB: item.maNXB },
      {
        $setOnInsert: {
          maNXB: item.maNXB,
          tenNXB: item.tenNXB,
          diaChi: item.diaChi,
          trangThai: TRANG_THAI_NXB.HOAT_DONG,
          nguoiTaoId: tkAdmin._id,
          nguoiCapNhatId: tkAdmin._id,
        },
      },
      { upsert: true, returnDocument: 'after' }
    );
    mapNXB[item.maNXB] = nxb;
    console.log(`[OK] Nha xuat ban: ${item.maNXB} - ${item.tenNXB}`);
  }

  // 6. Seed Sach (sach)
  const danhSachSachMau = [
    {
      maSach: 'S0001',
      tenSach: 'Lap trinh Web voi Node.js va Express',
      donGia: 120000,
      tongSoQuyen: 10,
      soQuyenDangMuon: 0,
      soQuyenHuHong: 0,
      soQuyenKhaDung: 10,
      soQuyenDaMat: 0,
      namXuatBan: 2024,
      maNXB: 'NXB003',
      nguonGocTacGia: 'Nguyen Van A',
    },
    {
      maSach: 'S0002',
      tenSach: 'Phat trien Giao dien Hien dai voi Vue.js 3',
      donGia: 135000,
      tongSoQuyen: 8,
      soQuyenDangMuon: 0,
      soQuyenHuHong: 0,
      soQuyenKhaDung: 8,
      soQuyenDaMat: 0,
      namXuatBan: 2024,
      maNXB: 'NXB003',
      nguonGocTacGia: 'Tran Minh B',
    },
    {
      maSach: 'S0003',
      tenSach: 'Thiet ke Co so du lieu NoSQL voi MongoDB',
      donGia: 150000,
      tongSoQuyen: 6,
      soQuyenDangMuon: 0,
      soQuyenHuHong: 1,
      soQuyenKhaDung: 5,
      soQuyenDaMat: 0,
      namXuatBan: 2023,
      maNXB: 'NXB001',
      nguonGocTacGia: 'Le Hoang C',
    },
    {
      maSach: 'S0004',
      tenSach: 'De Men Phieu Luu Ky',
      donGia: 65000,
      tongSoQuyen: 12,
      soQuyenDangMuon: 0,
      soQuyenHuHong: 0,
      soQuyenKhaDung: 12,
      soQuyenDaMat: 0,
      namXuatBan: 2022,
      maNXB: 'NXB002',
      nguonGocTacGia: 'To Hoai',
    },
    {
      maSach: 'S0005',
      tenSach: 'Mat Biec',
      donGia: 110000,
      tongSoQuyen: 5,
      soQuyenDangMuon: 0,
      soQuyenHuHong: 0,
      soQuyenKhaDung: 5,
      soQuyenDaMat: 0,
      namXuatBan: 2021,
      maNXB: 'NXB001',
      nguonGocTacGia: 'Nguyen Nhat Anh',
    },
  ];

  for (const item of danhSachSachMau) {
    const nxb = mapNXB[item.maNXB];
    await Sach.findOneAndUpdate(
      { maSach: item.maSach },
      {
        $setOnInsert: {
          maSach: item.maSach,
          tenSach: item.tenSach,
          donGia: item.donGia,
          tongSoQuyen: item.tongSoQuyen,
          soQuyenDangMuon: item.soQuyenDangMuon,
          soQuyenHuHong: item.soQuyenHuHong,
          soQuyenKhaDung: item.soQuyenKhaDung,
          soQuyenDaMat: item.soQuyenDaMat,
          namXuatBan: item.namXuatBan,
          nhaXuatBanId: nxb._id,
          maNXB: item.maNXB,
          nguonGocTacGia: item.nguonGocTacGia,
          trangThaiLuuThong: TRANG_THAI_LUU_THONG_SACH.DANG_LUU_THONG,
          nguoiTaoId: tkThuThu._id,
          nguoiCapNhatId: tkThuThu._id,
        },
      },
      { upsert: true, returnDocument: 'after' }
    );
    console.log(`[OK] Sach: ${item.maSach} - ${item.tenSach} (Kha dung: ${item.soQuyenKhaDung}/${item.tongSoQuyen})`);
  }

  console.log('\n======================================================');
  console.log('HOAN TAT SEED DU LIEU MAU! THONG TIN DANG NHAP TEST:');
  console.log('1. Quan tri vien (QUAN_TRI): admin / Admin@123');
  console.log('2. Thu thu (THU_THU)      : thuthu / ThuThu@123');
  console.log('3. Doc gia 1 (DOC_GIA)    : docgia01 / DocGia@123 (DUOC_MUON)');
  console.log('4. Doc gia 2 (DOC_GIA)    : docgia02 / DocGia@123 (BI_HAN_CHE)');
  console.log('======================================================\n');
}

seedDatabase()
  .catch((err) => {
    console.error('[LOI SEED DU LIEU]:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });

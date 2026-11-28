// Script khởi tạo CSDL MongoDB — chạy: mongosh "mongodb://localhost:27017/webquanlymuonsach" database/khoi_tao_csdl.js

const TEN_CSDL = "webquanlymuonsach";
const csdl = db.getSiblingDB(TEN_CSDL);

function taoHoacCapNhatCollection(tenCollection, jsonSchema) {
  const danhSachCollection = csdl.getCollectionNames();
  if (!danhSachCollection.includes(tenCollection)) {
    csdl.createCollection(tenCollection, {
      validator: { $jsonSchema: jsonSchema },
      validationLevel: "strict",
      validationAction: "error",
    });
    print(`[TAO MOI] Collection: ${tenCollection}`);
  } else {
    csdl.runCommand({
      collMod: tenCollection,
      validator: { $jsonSchema: jsonSchema },
      validationLevel: "strict",
      validationAction: "error",
    });
    print(`[CAP NHAT VALIDATOR] Collection: ${tenCollection}`);
  }
}

// 1. tai_khoan
taoHoacCapNhatCollection("tai_khoan", {
  bsonType: "object",
  required: ["tenDangNhap", "matKhauHash", "vaiTro", "trangThai", "ngayTao", "ngayCapNhat"],
  properties: {
    tenDangNhap: { bsonType: "string", minLength: 3 },
    email: { bsonType: ["string", "null"] },
    matKhauHash: { bsonType: "string", minLength: 10 },
    vaiTro: { enum: ["QUAN_TRI", "THU_THU", "DOC_GIA"] },
    trangThai: { enum: ["HOAT_DONG", "BI_KHOA", "CHO_XAC_MINH"] },
    lyDoKhoa: { bsonType: ["string", "null"] },
    ngayKhoa: { bsonType: ["date", "null"] },
    nguoiKhoaId: { bsonType: ["objectId", "null"] },
    lanDangNhapCuoi: { bsonType: ["date", "null"] },
    ngayDoiMatKhauCuoi: { bsonType: ["date", "null"] },
    ngayTao: { bsonType: "date" },
    ngayCapNhat: { bsonType: "date" },
  },
});
csdl.tai_khoan.createIndex({ tenDangNhap: 1 }, { unique: true, name: "idx_tai_khoan_ten_dang_nhap_unique" });
csdl.tai_khoan.createIndex({ email: 1 }, { unique: true, sparse: true, name: "idx_tai_khoan_email_unique_sparse" });
csdl.tai_khoan.createIndex({ vaiTro: 1, trangThai: 1 }, { name: "idx_tai_khoan_vai_tro_trang_thai" });

// 2. doc_gia
taoHoacCapNhatCollection("doc_gia", {
  bsonType: "object",
  required: [
    "taiKhoanId", "maDocGia", "hoLot", "ten", "dienThoai",
    "trangThaiQuyenMuon", "soSachDangMuon", "tongTienPhatChuaTra",
    "trangThaiHoSo", "ngayTao", "ngayCapNhat",
  ],
  properties: {
    taiKhoanId: { bsonType: "objectId" },
    maDocGia: { bsonType: "string", minLength: 1 },
    hoLot: { bsonType: "string", minLength: 1 },
    ten: { bsonType: "string", minLength: 1 },
    ngaySinh: { bsonType: ["date", "null"] },
    phai: { enum: ["NAM", "NU", "KHAC", null] },
    diaChi: { bsonType: ["string", "null"] },
    dienThoai: { bsonType: "string", minLength: 8 },
    trangThaiQuyenMuon: { enum: ["DUOC_MUON", "BI_HAN_CHE"] },
    lyDoHanCheMuon: { bsonType: ["string", "null"] },
    soSachDangMuon: { bsonType: "number", minimum: 0 },
    tongTienPhatChuaTra: { bsonType: "number", minimum: 0 },
    trangThaiHoSo: { enum: ["HOAT_DONG", "NGUNG_HOAT_DONG"] },
    nguoiTaoId: { bsonType: ["objectId", "null"] },
    nguoiCapNhatId: { bsonType: ["objectId", "null"] },
    ngayTao: { bsonType: "date" },
    ngayCapNhat: { bsonType: "date" },
  },
});
csdl.doc_gia.createIndex({ taiKhoanId: 1 }, { unique: true, name: "idx_doc_gia_tai_khoan_unique" });
csdl.doc_gia.createIndex({ maDocGia: 1 }, { unique: true, name: "idx_doc_gia_ma_doc_gia_unique" });
csdl.doc_gia.createIndex({ dienThoai: 1 }, { name: "idx_doc_gia_dien_thoai" });
csdl.doc_gia.createIndex({ hoLot: 1, ten: 1 }, { name: "idx_doc_gia_ho_ten" });
csdl.doc_gia.createIndex({ trangThaiQuyenMuon: 1, trangThaiHoSo: 1 }, { name: "idx_doc_gia_quyen_muon_ho_so" });

// 3. nhan_vien
taoHoacCapNhatCollection("nhan_vien", {
  bsonType: "object",
  required: [
    "taiKhoanId", "msnv", "hoTenNV", "chucVu",
    "soDienThoai", "trangThaiLamViec", "ngayTao", "ngayCapNhat",
  ],
  properties: {
    taiKhoanId: { bsonType: "objectId" },
    msnv: { bsonType: "string", minLength: 1 },
    hoTenNV: { bsonType: "string", minLength: 1 },
    chucVu: { bsonType: "string", minLength: 1 },
    diaChi: { bsonType: ["string", "null"] },
    soDienThoai: { bsonType: "string", minLength: 8 },
    trangThaiLamViec: { enum: ["DANG_LAM_VIEC", "NGHI_VIEC"] },
    nguoiTaoId: { bsonType: ["objectId", "null"] },
    nguoiCapNhatId: { bsonType: ["objectId", "null"] },
    ngayTao: { bsonType: "date" },
    ngayCapNhat: { bsonType: "date" },
  },
});
csdl.nhan_vien.createIndex({ taiKhoanId: 1 }, { unique: true, name: "idx_nhan_vien_tai_khoan_unique" });
csdl.nhan_vien.createIndex({ msnv: 1 }, { unique: true, name: "idx_nhan_vien_msnv_unique" });
csdl.nhan_vien.createIndex({ trangThaiLamViec: 1 }, { name: "idx_nhan_vien_trang_thai" });

// 4. nha_xuat_ban
taoHoacCapNhatCollection("nha_xuat_ban", {
  bsonType: "object",
  required: ["maNXB", "tenNXB", "trangThai", "nguoiTaoId", "nguoiCapNhatId", "ngayTao", "ngayCapNhat"],
  properties: {
    maNXB: { bsonType: "string", minLength: 1 },
    tenNXB: { bsonType: "string", minLength: 1 },
    diaChi: { bsonType: ["string", "null"] },
    trangThai: { enum: ["HOAT_DONG", "NGUNG_HOAT_DONG"] },
    nguoiTaoId: { bsonType: "objectId" },
    nguoiCapNhatId: { bsonType: "objectId" },
    ngayTao: { bsonType: "date" },
    ngayCapNhat: { bsonType: "date" },
  },
});
csdl.nha_xuat_ban.createIndex({ maNXB: 1 }, { unique: true, name: "idx_nha_xuat_ban_ma_nxb_unique" });
csdl.nha_xuat_ban.createIndex({ tenNXB: 1 }, { name: "idx_nha_xuat_ban_ten_nxb" });
csdl.nha_xuat_ban.createIndex({ trangThai: 1 }, { name: "idx_nha_xuat_ban_trang_thai" });

// 5. sach
taoHoacCapNhatCollection("sach", {
  bsonType: "object",
  required: [
    "maSach", "tenSach", "donGia", "tongSoQuyen", "soQuyenDangMuon",
    "soQuyenHuHong", "soQuyenKhaDung", "soQuyenDaMat", "namXuatBan",
    "nhaXuatBanId", "maNXB", "nguonGocTacGia", "trangThaiLuuThong",
    "nguoiTaoId", "nguoiCapNhatId", "ngayTao", "ngayCapNhat",
  ],
  properties: {
    maSach: { bsonType: "string", minLength: 1 },
    tenSach: { bsonType: "string", minLength: 1 },
    donGia: { bsonType: "number", minimum: 0 },
    tongSoQuyen: { bsonType: "number", minimum: 0 },
    soQuyenDangMuon: { bsonType: "number", minimum: 0 },
    soQuyenHuHong: { bsonType: "number", minimum: 0 },
    soQuyenKhaDung: { bsonType: "number", minimum: 0 },
    soQuyenDaMat: { bsonType: "number", minimum: 0 },
    namXuatBan: { bsonType: "number", minimum: 1000 },
    nhaXuatBanId: { bsonType: "objectId" },
    maNXB: { bsonType: "string", minLength: 1 },
    nguonGocTacGia: { bsonType: "string", minLength: 1 },
    trangThaiLuuThong: { enum: ["DANG_LUU_THONG", "TAM_NGUNG", "NGUNG_LUU_THONG"] },
    nguoiTaoId: { bsonType: "objectId" },
    nguoiCapNhatId: { bsonType: "objectId" },
    ngayTao: { bsonType: "date" },
    ngayCapNhat: { bsonType: "date" },
  },
});
csdl.sach.createIndex({ maSach: 1 }, { unique: true, name: "idx_sach_ma_sach_unique" });
csdl.sach.createIndex({ nhaXuatBanId: 1 }, { name: "idx_sach_nha_xuat_ban" });
csdl.sach.createIndex({ trangThaiLuuThong: 1, soQuyenKhaDung: 1 }, { name: "idx_sach_luu_thong_kha_dung" });
csdl.sach.createIndex({ tenSach: "text", nguonGocTacGia: "text" }, { default_language: "none", name: "idx_sach_tim_kiem_text" });

// 6. phieu_muon
taoHoacCapNhatCollection("phieu_muon", {
  bsonType: "object",
  required: [
    "maPhieuMuon", "docGiaId", "maDocGia", "nhanVienLapId",
    "ngayMuon", "trangThai", "chiTietMuon", "ngayTao", "ngayCapNhat",
  ],
  properties: {
    maPhieuMuon: { bsonType: "string", minLength: 1 },
    docGiaId: { bsonType: "objectId" },
    maDocGia: { bsonType: "string", minLength: 1 },
    nhanVienLapId: { bsonType: "objectId" },
    ngayMuon: { bsonType: "date" },
    trangThai: { enum: ["DANG_MO", "HOAN_TAT", "DA_HUY"] },
    ghiChu: { bsonType: ["string", "null"] },
    chiTietMuon: {
      bsonType: "array",
      minItems: 1,
      items: {
        bsonType: "object",
        required: [
          "_id", "sachId", "maSach", "tenSach", "donGiaTaiThoiDiemMuon",
          "hanTra", "trangThai", "soNgayTre", "soLanDaGiaHan",
          "lichSuGiaHan", "ngayCapNhatChiTiet",
        ],
        properties: {
          _id: { bsonType: "objectId" },
          sachId: { bsonType: "objectId" },
          maSach: { bsonType: "string", minLength: 1 },
          tenSach: { bsonType: "string", minLength: 1 },
          donGiaTaiThoiDiemMuon: { bsonType: "number", minimum: 0 },
          hanTra: { bsonType: "date" },
          ngayTraThucTe: { bsonType: ["date", "null"] },
          trangThai: {
            enum: ["DANG_MUON", "QUA_HAN", "DA_TRA_DUNG_HAN", "DA_TRA_TRE", "HU_HONG", "MAT_SACH", "DA_XU_LY"],
          },
          tinhTrangKhiTra: { enum: ["NGUYEN_VEN", "HU_HONG_NHE", "HU_HONG_NANG", "MAT", null] },
          moTaHuHong: { bsonType: ["string", "null"] },
          soNgayTre: { bsonType: "number", minimum: 0 },
          soLanDaGiaHan: { bsonType: "number", minimum: 0 },
          lichSuGiaHan: {
            bsonType: "array",
            items: {
              bsonType: "object",
              required: ["hanTraCu", "hanTraMoi", "nguoiDuyetId", "ngayDuyet"],
              properties: {
                hanTraCu: { bsonType: "date" },
                hanTraMoi: { bsonType: "date" },
                nguoiDuyetId: { bsonType: "objectId" },
                ngayDuyet: { bsonType: "date" },
                lyDo: { bsonType: ["string", "null"] },
              },
            },
          },
          nhanVienXacNhanTraId: { bsonType: ["objectId", "null"] },
          ngayCapNhatChiTiet: { bsonType: "date" },
        },
      },
    },
    nguoiHuyId: { bsonType: ["objectId", "null"] },
    ngayHuy: { bsonType: ["date", "null"] },
    lyDoHuy: { bsonType: ["string", "null"] },
    ngayTao: { bsonType: "date" },
    ngayCapNhat: { bsonType: "date" },
  },
});
csdl.phieu_muon.createIndex({ maPhieuMuon: 1 }, { unique: true, name: "idx_phieu_muon_ma_phieu_unique" });
csdl.phieu_muon.createIndex({ docGiaId: 1, ngayMuon: -1 }, { name: "idx_phieu_muon_doc_gia_ngay_muon" });
csdl.phieu_muon.createIndex({ trangThai: 1, ngayMuon: -1 }, { name: "idx_phieu_muon_trang_thai_ngay_muon" });
csdl.phieu_muon.createIndex({ "chiTietMuon.sachId": 1, "chiTietMuon.trangThai": 1 }, { name: "idx_phieu_muon_chi_tiet_sach_trang_thai" });
csdl.phieu_muon.createIndex({ "chiTietMuon.trangThai": 1, "chiTietMuon.hanTra": 1 }, { name: "idx_phieu_muon_chi_tiet_qua_han" });

// 7. khoan_phat
taoHoacCapNhatCollection("khoan_phat", {
  bsonType: "object",
  required: [
    "maKhoanPhat", "docGiaId", "phieuMuonId", "chiTietMuonId",
    "loaiPhat", "mucPhatApDung", "soTienPhat", "soTienDaThanhToan",
    "trangThai", "nguoiTaoId", "ngayTao", "ngayCapNhat",
  ],
  properties: {
    maKhoanPhat: { bsonType: "string", minLength: 1 },
    docGiaId: { bsonType: "objectId" },
    phieuMuonId: { bsonType: "objectId" },
    chiTietMuonId: { bsonType: "objectId" },
    loaiPhat: { enum: ["TRA_TRE", "HU_HONG", "MAT_SACH"] },
    soNgayTre: { bsonType: ["number", "null"], minimum: 0 },
    mucPhatApDung: { bsonType: "number", minimum: 0 },
    soTienPhat: { bsonType: "number", minimum: 0 },
    soTienDaThanhToan: { bsonType: "number", minimum: 0 },
    trangThai: { enum: ["CHUA_THANH_TOAN", "THANH_TOAN_MOT_PHAN", "DA_THANH_TOAN", "DUOC_MIEN", "DA_HUY"] },
    lyDo: { bsonType: ["string", "null"] },
    nguoiTaoId: { bsonType: "objectId" },
    nguoiXuLyId: { bsonType: ["objectId", "null"] },
    ngayXuLy: { bsonType: ["date", "null"] },
    ghiChuXuLy: { bsonType: ["string", "null"] },
    ngayTao: { bsonType: "date" },
    ngayCapNhat: { bsonType: "date" },
  },
});
csdl.khoan_phat.createIndex({ maKhoanPhat: 1 }, { unique: true, name: "idx_khoan_phat_ma_unique" });
csdl.khoan_phat.createIndex({ docGiaId: 1, trangThai: 1 }, { name: "idx_khoan_phat_doc_gia_trang_thai" });
csdl.khoan_phat.createIndex({ phieuMuonId: 1, chiTietMuonId: 1 }, { name: "idx_khoan_phat_phieu_chi_tiet" });

// 8. nhat_ky_he_thong
taoHoacCapNhatCollection("nhat_ky_he_thong", {
  bsonType: "object",
  required: ["hanhDong", "doiTuongCollection", "doiTuongId", "nguoiThucHienId", "vaiTroNguoiThucHien", "thoiDiem"],
  properties: {
    hanhDong: {
      enum: [
        "LAP_PHIEU_MUON", "XAC_NHAN_TRA_SACH", "GHI_NHAN_HU_HONG", "GHI_NHAN_MAT_SACH",
        "GIA_HAN_MUON", "DIEU_CHINH_SO_LUONG_SACH", "KHOA_TAI_KHOAN", "MO_KHOA_TAI_KHOAN",
        "HAN_CHE_QUYEN_MUON", "MO_QUYEN_MUON", "XAC_NHAN_THANH_TOAN_PHAT",
        "MIEN_PHAT", "HUY_PHAT", "CAP_NHAT_CAU_HINH",
      ],
    },
    doiTuongCollection: { bsonType: "string", minLength: 1 },
    doiTuongId: { bsonType: "objectId" },
    nguoiThucHienId: { bsonType: "objectId" },
    vaiTroNguoiThucHien: { enum: ["QUAN_TRI", "THU_THU", "DOC_GIA"] },
    duLieuTruoc: { bsonType: ["object", "null"] },
    duLieuSau: { bsonType: ["object", "null"] },
    lyDo: { bsonType: ["string", "null"] },
    thoiDiem: { bsonType: "date" },
  },
});
csdl.nhat_ky_he_thong.createIndex({ doiTuongCollection: 1, doiTuongId: 1, thoiDiem: -1 }, { name: "idx_nhat_ky_doi_tuong_thoi_diem" });
csdl.nhat_ky_he_thong.createIndex({ nguoiThucHienId: 1, thoiDiem: -1 }, { name: "idx_nhat_ky_nguoi_thuc_hien_thoi_diem" });
csdl.nhat_ky_he_thong.createIndex({ hanhDong: 1, thoiDiem: -1 }, { name: "idx_nhat_ky_hanh_dong_thoi_diem" });

// 9. cau_hinh_thu_vien
taoHoacCapNhatCollection("cau_hinh_thu_vien", {
  bsonType: "object",
  required: ["maCauHinh", "ngayCapNhat"],
  properties: {
    maCauHinh: { enum: ["MAC_DINH"] },
    soNgayMuonMacDinh: { bsonType: ["number", "null"], minimum: 1 },
    soSachMuonToiDa: { bsonType: ["number", "null"], minimum: 1 },
    tienPhatTraTreMoiNgay: { bsonType: ["number", "null"], minimum: 0 },
    soLanGiaHanToiDa: { bsonType: ["number", "null"], minimum: 0 },
    soNgayGiaHanMoiLan: { bsonType: ["number", "null"], minimum: 1 },
    hanCheMuonKhiCoViPham: { bsonType: ["bool", "null"] },
    choPhepDatTruoc: { bsonType: ["bool", "null"] },
    cachCapTaiKhoanDocGia: { enum: ["TU_DANG_KY_VA_NHAN_VIEN_TAO", "CHI_TU_DANG_KY", "CHI_NHAN_VIEN_TAO", null] },
    yeuCauXacMinhTaiKhoanDocGia: { bsonType: ["bool", "null"] },
    yeuCauDienThoaiDuyNhat: { bsonType: ["bool", "null"] },
    soNgayNhacTraTruocHan: { bsonType: ["number", "null"], minimum: 0 },
    nguongSoNgayQuaHanKhoaMuon: { bsonType: ["number", "null"], minimum: 1 },
    tyLeBoiThuongSachMat: { bsonType: ["number", "null"], minimum: 0 },
    tyLeBoiThuongSachHuHong: { bsonType: ["number", "null"], minimum: 0 },
    nguoiCapNhatId: { bsonType: ["objectId", "null"] },
    ngayCapNhat: { bsonType: "date" },
  },
});
csdl.cau_hinh_thu_vien.createIndex({ maCauHinh: 1 }, { unique: true, name: "idx_cau_hinh_ma_unique" });

// Khởi tạo cấu hình mặc định (các chính sách đang ở trạng thái PENDING DECISION)
csdl.cau_hinh_thu_vien.updateOne(
  { maCauHinh: "MAC_DINH" },
  {
    $setOnInsert: {
      maCauHinh: "MAC_DINH",
      soNgayMuonMacDinh: 14,
      soSachMuonToiDa: 5,
      tienPhatTraTreMoiNgay: 2000,
      soLanGiaHanToiDa: 1,
      soNgayGiaHanMoiLan: null,
      hanCheMuonKhiCoViPham: true,
      choPhepDatTruoc: false,
      cachCapTaiKhoanDocGia: "TU_DANG_KY_VA_NHAN_VIEN_TAO",
      yeuCauXacMinhTaiKhoanDocGia: false,
      yeuCauDienThoaiDuyNhat: true,
      soNgayNhacTraTruocHan: null,
      nguongSoNgayQuaHanKhoaMuon: null,
      tyLeBoiThuongSachMat: null,
      tyLeBoiThuongSachHuHong: null,
      nguoiCapNhatId: null,
      ngayCapNhat: new Date(),
    },
  },
  { upsert: true }
);

print(`\n[HOAN TAT] Da khoi tao xong 9 collection, $jsonSchema va index cho CSDL '${TEN_CSDL}'.`);

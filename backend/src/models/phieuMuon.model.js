const mongoose = require('mongoose');
const {
  TRANG_THAI_PHIEU_MUON,
  TRANG_THAI_CHI_TIET_MUON,
  TINH_TRANG_KHI_TRA,
  TEN_COLLECTION,
} = require('../constants/enums');

const lichSuGiaHanSchema = new mongoose.Schema(
  {
    hanTraCu: {
      type: Date,
      required: [true, 'hanTraCu la bat buoc'],
    },
    hanTraMoi: {
      type: Date,
      required: [true, 'hanTraMoi la bat buoc'],
    },
    nguoiDuyetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NhanVien',
      required: [true, 'nguoiDuyetId la bat buoc'],
    },
    ngayDuyet: {
      type: Date,
      required: [true, 'ngayDuyet la bat buoc'],
      default: Date.now,
    },
    lyDo: {
      type: String,
      default: null,
    },
  },
  {
    _id: false,
    versionKey: false,
  }
);

const chiTietMuonSchema = new mongoose.Schema(
  {
    sachId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sach',
      required: [true, 'sachId la bat buoc'],
    },
    maSach: {
      type: String,
      required: [true, 'maSach la bat buoc'],
      trim: true,
      minlength: 1,
    },
    tenSach: {
      type: String,
      required: [true, 'tenSach la bat buoc'],
      trim: true,
      minlength: 1,
    },
    donGiaTaiThoiDiemMuon: {
      type: Number,
      required: [true, 'donGiaTaiThoiDiemMuon la bat buoc'],
      min: [0, 'donGiaTaiThoiDiemMuon khong duoc am'],
    },
    hanTra: {
      type: Date,
      required: [true, 'hanTra la bat buoc'],
    },
    ngayTraThucTe: {
      type: Date,
      default: null,
    },
    trangThai: {
      type: String,
      required: true,
      enum: Object.values(TRANG_THAI_CHI_TIET_MUON),
      default: TRANG_THAI_CHI_TIET_MUON.DANG_MUON,
    },
    tinhTrangKhiTra: {
      type: String,
      enum: [...Object.values(TINH_TRANG_KHI_TRA), null],
      default: null,
    },
    moTaHuHong: {
      type: String,
      default: null,
    },
    soNgayTre: {
      type: Number,
      required: true,
      min: [0, 'soNgayTre khong duoc am'],
      default: 0,
    },
    soLanDaGiaHan: {
      type: Number,
      required: true,
      min: [0, 'soLanDaGiaHan khong duoc am'],
      default: 0,
    },
    lichSuGiaHan: {
      type: [lichSuGiaHanSchema],
      required: true,
      default: [],
    },
    nhanVienXacNhanTraId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NhanVien',
      default: null,
    },
    ngayCapNhatChiTiet: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    _id: true,
    versionKey: false,
  }
);

const phieuMuonSchema = new mongoose.Schema(
  {
    maPhieuMuon: {
      type: String,
      required: [true, 'maPhieuMuon la bat buoc'],
      trim: true,
      minlength: 1,
    },
    docGiaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DocGia',
      required: [true, 'docGiaId la bat buoc'],
    },
    maDocGia: {
      type: String,
      required: [true, 'maDocGia la bat buoc'],
      trim: true,
      minlength: 1,
    },
    nhanVienLapId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NhanVien',
      required: [true, 'nhanVienLapId la bat buoc'],
    },
    ngayMuon: {
      type: Date,
      required: [true, 'ngayMuon la bat buoc'],
      default: Date.now,
    },
    trangThai: {
      type: String,
      required: true,
      enum: Object.values(TRANG_THAI_PHIEU_MUON),
      default: TRANG_THAI_PHIEU_MUON.DANG_MO,
    },
    ghiChu: {
      type: String,
      default: null,
    },
    chiTietMuon: {
      type: [chiTietMuonSchema],
      required: [true, 'chiTietMuon la bat buoc'],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length >= 1,
        message: 'Phieu muon phai co it nhat 1 cuon sach trong chiTietMuon',
      },
    },
    nguoiHuyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NhanVien',
      default: null,
    },
    ngayHuy: {
      type: Date,
      default: null,
    },
    lyDoHuy: {
      type: String,
      default: null,
    },
  },
  {
    collection: TEN_COLLECTION.PHIEU_MUON,
    versionKey: false,
    timestamps: {
      createdAt: 'ngayTao',
      updatedAt: 'ngayCapNhat',
    },
  }
);

// Indexes theo docs/db.md
phieuMuonSchema.index(
  { maPhieuMuon: 1 },
  { unique: true, name: 'idx_phieu_muon_ma_phieu_unique' }
);
phieuMuonSchema.index(
  { docGiaId: 1, ngayMuon: -1 },
  { name: 'idx_phieu_muon_doc_gia_ngay_muon' }
);
phieuMuonSchema.index(
  { trangThai: 1, ngayMuon: -1 },
  { name: 'idx_phieu_muon_trang_thai_ngay_muon' }
);
phieuMuonSchema.index(
  { 'chiTietMuon.sachId': 1, 'chiTietMuon.trangThai': 1 },
  { name: 'idx_phieu_muon_chi_tiet_sach_trang_thai' }
);
phieuMuonSchema.index(
  { 'chiTietMuon.trangThai': 1, 'chiTietMuon.hanTra': 1 },
  { name: 'idx_phieu_muon_chi_tiet_qua_han' }
);

const PhieuMuon = mongoose.model('PhieuMuon', phieuMuonSchema);

module.exports = PhieuMuon;

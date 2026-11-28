const mongoose = require('mongoose');
const {
  LOAI_PHAT,
  TRANG_THAI_KHOAN_PHAT,
  TEN_COLLECTION,
} = require('../constants/enums');

const khoanPhatSchema = new mongoose.Schema(
  {
    maKhoanPhat: {
      type: String,
      required: [true, 'maKhoanPhat la bat buoc'],
      trim: true,
      minlength: 1,
    },
    docGiaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DocGia',
      required: [true, 'docGiaId la bat buoc'],
    },
    phieuMuonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PhieuMuon',
      required: [true, 'phieuMuonId la bat buoc'],
    },
    chiTietMuonId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'chiTietMuonId la bat buoc'],
    },
    loaiPhat: {
      type: String,
      required: [true, 'loaiPhat la bat buoc'],
      enum: Object.values(LOAI_PHAT),
    },
    soNgayTre: {
      type: Number,
      min: [0, 'soNgayTre khong duoc am'],
      default: null,
    },
    mucPhatApDung: {
      type: Number,
      required: [true, 'mucPhatApDung la bat buoc'],
      min: [0, 'mucPhatApDung khong duoc am'],
    },
    soTienPhat: {
      type: Number,
      required: [true, 'soTienPhat la bat buoc'],
      min: [0, 'soTienPhat khong duoc am'],
    },
    soTienDaThanhToan: {
      type: Number,
      required: true,
      min: [0, 'soTienDaThanhToan khong duoc am'],
      default: 0,
    },
    trangThai: {
      type: String,
      required: true,
      enum: Object.values(TRANG_THAI_KHOAN_PHAT),
      default: TRANG_THAI_KHOAN_PHAT.CHUA_THANH_TOAN,
    },
    lyDo: {
      type: String,
      default: null,
    },
    nguoiTaoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NhanVien',
      required: [true, 'nguoiTaoId la bat buoc'],
    },
    nguoiXuLyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NhanVien',
      default: null,
    },
    ngayXuLy: {
      type: Date,
      default: null,
    },
    ghiChuXuLy: {
      type: String,
      default: null,
    },
  },
  {
    collection: TEN_COLLECTION.KHOAN_PHAT,
    versionKey: false,
    timestamps: {
      createdAt: 'ngayTao',
      updatedAt: 'ngayCapNhat',
    },
  }
);

khoanPhatSchema.index(
  { maKhoanPhat: 1 },
  { unique: true, name: 'idx_khoan_phat_ma_unique' }
);
khoanPhatSchema.index(
  { docGiaId: 1, trangThai: 1 },
  { name: 'idx_khoan_phat_doc_gia_trang_thai' }
);
khoanPhatSchema.index(
  { phieuMuonId: 1, chiTietMuonId: 1 },
  { name: 'idx_khoan_phat_phieu_chi_tiet' }
);

const KhoanPhat = mongoose.model('KhoanPhat', khoanPhatSchema);

module.exports = KhoanPhat;

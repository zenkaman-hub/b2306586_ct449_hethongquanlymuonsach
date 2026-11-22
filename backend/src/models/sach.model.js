const mongoose = require('mongoose');
const {
  TRANG_THAI_LUU_THONG_SACH,
  TEN_COLLECTION,
} = require('../constants/enums');

const sachSchema = new mongoose.Schema(
  {
    maSach: {
      type: String,
      required: [true, 'Ma sach (maSach) la bat buoc'],
      trim: true,
      minlength: 1,
    },
    tenSach: {
      type: String,
      required: [true, 'Ten sach (tenSach) la bat buoc'],
      trim: true,
      minlength: 1,
    },
    donGia: {
      type: Number,
      required: [true, 'Don gia la bat buoc'],
      min: [0, 'Don gia khong duoc am'],
    },
    tongSoQuyen: {
      type: Number,
      required: [true, 'Tong so quyen la bat buoc'],
      min: [0, 'Tong so quyen khong duoc am'],
    },
    soQuyenDangMuon: {
      type: Number,
      required: true,
      min: [0, 'So quyen dang muon khong duoc am'],
      default: 0,
    },
    soQuyenHuHong: {
      type: Number,
      required: true,
      min: [0, 'So quyen hu hong khong duoc am'],
      default: 0,
    },
    soQuyenKhaDung: {
      type: Number,
      required: true,
      min: [0, 'So quyen kha dung khong duoc am'],
    },
    soQuyenDaMat: {
      type: Number,
      required: true,
      min: [0, 'So quyen da mat khong duoc am'],
      default: 0,
    },
    namXuatBan: {
      type: Number,
      required: [true, 'Nam xuat ban la bat buoc'],
      min: [1000, 'Nam xuat ban khong hop le'],
    },
    nhaXuatBanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NhaXuatBan',
      required: [true, 'nhaXuatBanId la bat buoc'],
    },
    maNXB: {
      type: String,
      required: [true, 'maNXB la bat buoc'],
      trim: true,
      minlength: 1,
    },
    nguonGocTacGia: {
      type: String,
      required: [true, 'Nguon goc / Tac gia la bat buoc'],
      trim: true,
      minlength: 1,
    },
    trangThaiLuuThong: {
      type: String,
      required: true,
      enum: Object.values(TRANG_THAI_LUU_THONG_SACH),
      default: TRANG_THAI_LUU_THONG_SACH.DANG_LUU_THONG,
    },
    nguoiTaoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TaiKhoan',
      required: [true, 'nguoiTaoId la bat buoc'],
    },
    nguoiCapNhatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TaiKhoan',
      required: [true, 'nguoiCapNhatId la bat buoc'],
    },
  },
  {
    collection: TEN_COLLECTION.SACH,
    versionKey: false,
    timestamps: {
      createdAt: 'ngayTao',
      updatedAt: 'ngayCapNhat',
    },
  }
);

// Indexes theo docs/db.md
sachSchema.index(
  { maSach: 1 },
  { unique: true, name: 'idx_sach_ma_sach_unique' }
);
sachSchema.index({ nhaXuatBanId: 1 }, { name: 'idx_sach_nha_xuat_ban' });
sachSchema.index(
  { trangThaiLuuThong: 1, soQuyenKhaDung: 1 },
  { name: 'idx_sach_luu_thong_kha_dung' }
);
sachSchema.index(
  { tenSach: 'text', nguonGocTacGia: 'text' },
  { default_language: 'none', name: 'idx_sach_tim_kiem_text' }
);

const Sach = mongoose.model('Sach', sachSchema);

module.exports = Sach;

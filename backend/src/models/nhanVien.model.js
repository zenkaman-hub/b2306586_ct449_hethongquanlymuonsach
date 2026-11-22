const mongoose = require('mongoose');
const {
  TRANG_THAI_LAM_VIEC,
  TEN_COLLECTION,
} = require('../constants/enums');

const nhanVienSchema = new mongoose.Schema(
  {
    taiKhoanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TaiKhoan',
      required: [true, 'taiKhoanId la bat buoc'],
    },
    msnv: {
      type: String,
      required: [true, 'Ma so nhan vien (msnv) la bat buoc'],
      trim: true,
      minlength: 1,
    },
    hoTenNV: {
      type: String,
      required: [true, 'Ho ten nhan vien la bat buoc'],
      trim: true,
      minlength: 1,
    },
    chucVu: {
      type: String,
      required: [true, 'Chuc vu la bat buoc'],
      trim: true,
      minlength: 1,
    },
    diaChi: {
      type: String,
      trim: true,
      default: null,
    },
    soDienThoai: {
      type: String,
      required: [true, 'So dien thoai la bat buoc'],
      trim: true,
      minlength: [8, 'So dien thoai phai co it nhat 8 ky tu'],
    },
    trangThaiLamViec: {
      type: String,
      required: true,
      enum: Object.values(TRANG_THAI_LAM_VIEC),
      default: TRANG_THAI_LAM_VIEC.DANG_LAM_VIEC,
    },
    nguoiTaoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TaiKhoan',
      default: null,
    },
    nguoiCapNhatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TaiKhoan',
      default: null,
    },
  },
  {
    collection: TEN_COLLECTION.NHAN_VIEN,
    versionKey: false,
    timestamps: {
      createdAt: 'ngayTao',
      updatedAt: 'ngayCapNhat',
    },
  }
);

// Indexes theo docs/db.md
nhanVienSchema.index(
  { taiKhoanId: 1 },
  { unique: true, name: 'idx_nhan_vien_tai_khoan_unique' }
);
nhanVienSchema.index(
  { msnv: 1 },
  { unique: true, name: 'idx_nhan_vien_msnv_unique' }
);
nhanVienSchema.index(
  { trangThaiLamViec: 1 },
  { name: 'idx_nhan_vien_trang_thai' }
);

const NhanVien = mongoose.model('NhanVien', nhanVienSchema);

module.exports = NhanVien;

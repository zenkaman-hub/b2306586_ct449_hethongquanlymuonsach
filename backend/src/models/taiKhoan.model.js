const mongoose = require('mongoose');
const {
  VAI_TRO,
  TRANG_THAI_TAI_KHOAN,
  TEN_COLLECTION,
} = require('../constants/enums');

const taiKhoanSchema = new mongoose.Schema(
  {
    tenDangNhap: {
      type: String,
      required: [true, 'Ten dang nhap la bat buoc'],
      trim: true,
      lowercase: true,
      minlength: [3, 'Ten dang nhap phai co it nhat 3 ky tu'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
    },
    matKhauHash: {
      type: String,
      required: [true, 'Mat khau da bam la bat buoc'],
      minlength: 10,
    },
    vaiTro: {
      type: String,
      required: [true, 'Vai tro la bat buoc'],
      enum: Object.values(VAI_TRO),
    },
    trangThai: {
      type: String,
      required: [true, 'Trang thai tai khoan la bat buoc'],
      enum: Object.values(TRANG_THAI_TAI_KHOAN),
      default: TRANG_THAI_TAI_KHOAN.HOAT_DONG,
    },
    lyDoKhoa: {
      type: String,
      default: null,
    },
    ngayKhoa: {
      type: Date,
      default: null,
    },
    nguoiKhoaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TaiKhoan',
      default: null,
    },
    lanDangNhapCuoi: {
      type: Date,
      default: null,
    },
    ngayDoiMatKhauCuoi: {
      type: Date,
      default: null,
    },
  },
  {
    collection: TEN_COLLECTION.TAI_KHOAN,
    versionKey: false,
    timestamps: {
      createdAt: 'ngayTao',
      updatedAt: 'ngayCapNhat',
    },
  }
);

taiKhoanSchema.index(
  { tenDangNhap: 1 },
  { unique: true, name: 'idx_tai_khoan_ten_dang_nhap_unique' }
);
taiKhoanSchema.index(
  { email: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { email: { $type: 'string' } },
    name: 'idx_tai_khoan_email_unique_sparse',
  }
);
taiKhoanSchema.index(
  { vaiTro: 1, trangThai: 1 },
  { name: 'idx_tai_khoan_vai_tro_trang_thai' }
);

const TaiKhoan = mongoose.model('TaiKhoan', taiKhoanSchema);

module.exports = TaiKhoan;

const mongoose = require('mongoose');
const {
  TRANG_THAI_NXB,
  TEN_COLLECTION,
} = require('../constants/enums');

const nhaXuatBanSchema = new mongoose.Schema(
  {
    maNXB: {
      type: String,
      required: [true, 'Ma nha xuat ban (maNXB) la bat buoc'],
      trim: true,
      minlength: 1,
    },
    tenNXB: {
      type: String,
      required: [true, 'Ten nha xuat ban (tenNXB) la bat buoc'],
      trim: true,
      minlength: 1,
    },
    diaChi: {
      type: String,
      trim: true,
      default: null,
    },
    trangThai: {
      type: String,
      required: true,
      enum: Object.values(TRANG_THAI_NXB),
      default: TRANG_THAI_NXB.HOAT_DONG,
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
    collection: TEN_COLLECTION.NHA_XUAT_BAN,
    versionKey: false,
    timestamps: {
      createdAt: 'ngayTao',
      updatedAt: 'ngayCapNhat',
    },
  }
);

nhaXuatBanSchema.index(
  { maNXB: 1 },
  { unique: true, name: 'idx_nha_xuat_ban_ma_nxb_unique' }
);
nhaXuatBanSchema.index(
  { tenNXB: 1 },
  { name: 'idx_nha_xuat_ban_ten_nxb' }
);
nhaXuatBanSchema.index(
  { trangThai: 1 },
  { name: 'idx_nha_xuat_ban_trang_thai' }
);

const NhaXuatBan = mongoose.model('NhaXuatBan', nhaXuatBanSchema);

module.exports = NhaXuatBan;

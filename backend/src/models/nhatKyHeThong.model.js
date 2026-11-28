const mongoose = require('mongoose');
const {
  HANH_DONG_NHAT_KY,
  VAI_TRO,
  TEN_COLLECTION,
} = require('../constants/enums');

const nhatKyHeThongSchema = new mongoose.Schema(
  {
    hanhDong: {
      type: String,
      required: [true, 'hanhDong la bat buoc'],
      enum: Object.values(HANH_DONG_NHAT_KY),
    },
    doiTuongCollection: {
      type: String,
      required: [true, 'doiTuongCollection la bat buoc'],
      trim: true,
      minlength: 1,
    },
    doiTuongId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'doiTuongId la bat buoc'],
    },
    nguoiThucHienId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TaiKhoan',
      required: [true, 'nguoiThucHienId la bat buoc'],
    },
    vaiTroNguoiThucHien: {
      type: String,
      required: [true, 'vaiTroNguoiThucHien la bat buoc'],
      enum: Object.values(VAI_TRO),
    },
    duLieuTruoc: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    duLieuSau: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    lyDo: {
      type: String,
      default: null,
    },
    thoiDiem: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    collection: TEN_COLLECTION.NHAT_KY_HE_THONG,
    versionKey: false,
    timestamps: false,
  }
);

nhatKyHeThongSchema.index(
  { doiTuongCollection: 1, doiTuongId: 1, thoiDiem: -1 },
  { name: 'idx_nhat_ky_doi_tuong_thoi_diem' }
);
nhatKyHeThongSchema.index(
  { nguoiThucHienId: 1, thoiDiem: -1 },
  { name: 'idx_nhat_ky_nguoi_thuc_hien_thoi_diem' }
);
nhatKyHeThongSchema.index(
  { hanhDong: 1, thoiDiem: -1 },
  { name: 'idx_nhat_ky_hanh_dong_thoi_diem' }
);

const NhatKyHeThong = mongoose.model('NhatKyHeThong', nhatKyHeThongSchema);

module.exports = NhatKyHeThong;

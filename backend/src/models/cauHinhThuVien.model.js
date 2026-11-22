const mongoose = require('mongoose');
const {
  MA_CAU_HINH,
  CACH_CAP_TAI_KHOAN_DOC_GIA,
  TEN_COLLECTION,
} = require('../constants/enums');

const cauHinhThuVienSchema = new mongoose.Schema(
  {
    maCauHinh: {
      type: String,
      required: [true, 'maCauHinh la bat buoc'],
      enum: Object.values(MA_CAU_HINH),
      default: MA_CAU_HINH.MAC_DINH,
    },
    soNgayMuonMacDinh: {
      type: Number,
      min: 1,
      default: 14, // PENDING DECISION
    },
    soSachMuonToiDa: {
      type: Number,
      min: 1,
      default: 5, // PENDING DECISION
    },
    tienPhatTraTreMoiNgay: {
      type: Number,
      min: 0,
      default: 2000, // PENDING DECISION
    },
    soLanGiaHanToiDa: {
      type: Number,
      min: 0,
      default: 1, // PENDING DECISION
    },
    soNgayGiaHanMoiLan: {
      type: Number,
      min: 1,
      default: null, // PENDING DECISION
    },
    hanCheMuonKhiCoViPham: {
      type: Boolean,
      default: true, // PENDING DECISION
    },
    choPhepDatTruoc: {
      type: Boolean,
      default: false, // PENDING DECISION
    },
    cachCapTaiKhoanDocGia: {
      type: String,
      enum: [...Object.values(CACH_CAP_TAI_KHOAN_DOC_GIA), null],
      default: CACH_CAP_TAI_KHOAN_DOC_GIA.TU_DANG_KY_VA_NHAN_VIEN_TAO, // PENDING DECISION
    },
    yeuCauXacMinhTaiKhoanDocGia: {
      type: Boolean,
      default: false, // PENDING DECISION
    },
    yeuCauDienThoaiDuyNhat: {
      type: Boolean,
      default: true, // PENDING DECISION
    },
    soNgayNhacTraTruocHan: {
      type: Number,
      min: 0,
      default: null, // PENDING DECISION
    },
    nguongSoNgayQuaHanKhoaMuon: {
      type: Number,
      min: 1,
      default: null, // PENDING DECISION
    },
    tyLeBoiThuongSachMat: {
      type: Number,
      min: 0,
      default: null, // PENDING DECISION
    },
    tyLeBoiThuongSachHuHong: {
      type: Number,
      min: 0,
      default: null, // PENDING DECISION
    },
    nguoiCapNhatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TaiKhoan',
      default: null,
    },
    ngayCapNhat: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    collection: TEN_COLLECTION.CAU_HINH_THU_VIEN,
    versionKey: false,
    timestamps: {
      createdAt: false,
      updatedAt: 'ngayCapNhat',
    },
  }
);

// Index theo docs/db.md
cauHinhThuVienSchema.index(
  { maCauHinh: 1 },
  { unique: true, name: 'idx_cau_hinh_ma_unique' }
);

const CauHinhThuVien = mongoose.model('CauHinhThuVien', cauHinhThuVienSchema);

module.exports = CauHinhThuVien;

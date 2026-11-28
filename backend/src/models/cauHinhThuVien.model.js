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
    // Các chính sách mặc định đang ở trạng thái PENDING DECISION
    soNgayMuonMacDinh: {
      type: Number,
      min: 1,
      default: 14,
    },
    soSachMuonToiDa: {
      type: Number,
      min: 1,
      default: 5,
    },
    tienPhatTraTreMoiNgay: {
      type: Number,
      min: 0,
      default: 2000,
    },
    soLanGiaHanToiDa: {
      type: Number,
      min: 0,
      default: 1,
    },
    soNgayGiaHanMoiLan: {
      type: Number,
      min: 1,
      default: null,
    },
    hanCheMuonKhiCoViPham: {
      type: Boolean,
      default: true,
    },
    choPhepDatTruoc: {
      type: Boolean,
      default: false,
    },
    cachCapTaiKhoanDocGia: {
      type: String,
      enum: [...Object.values(CACH_CAP_TAI_KHOAN_DOC_GIA), null],
      default: CACH_CAP_TAI_KHOAN_DOC_GIA.TU_DANG_KY_VA_NHAN_VIEN_TAO,
    },
    yeuCauXacMinhTaiKhoanDocGia: {
      type: Boolean,
      default: false,
    },
    yeuCauDienThoaiDuyNhat: {
      type: Boolean,
      default: true,
    },
    soNgayNhacTraTruocHan: {
      type: Number,
      min: 0,
      default: null,
    },
    nguongSoNgayQuaHanKhoaMuon: {
      type: Number,
      min: 1,
      default: null,
    },
    tyLeBoiThuongSachMat: {
      type: Number,
      min: 0,
      default: null,
    },
    tyLeBoiThuongSachHuHong: {
      type: Number,
      min: 0,
      default: null,
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

cauHinhThuVienSchema.index(
  { maCauHinh: 1 },
  { unique: true, name: 'idx_cau_hinh_ma_unique' }
);

const CauHinhThuVien = mongoose.model('CauHinhThuVien', cauHinhThuVienSchema);

module.exports = CauHinhThuVien;

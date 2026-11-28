const mongoose = require('mongoose');
const {
  PHAI,
  TRANG_THAI_QUYEN_MUON,
  TRANG_THAI_HO_SO_DOC_GIA,
  TEN_COLLECTION,
} = require('../constants/enums');

const docGiaSchema = new mongoose.Schema(
  {
    taiKhoanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TaiKhoan',
      required: [true, 'taiKhoanId la bat buoc'],
    },
    maDocGia: {
      type: String,
      required: [true, 'Ma doc gia la bat buoc'],
      trim: true,
      minlength: 1,
    },
    hoLot: {
      type: String,
      required: [true, 'Ho va ten lot la bat buoc'],
      trim: true,
      minlength: 1,
    },
    ten: {
      type: String,
      required: [true, 'Ten doc gia la bat buoc'],
      trim: true,
      minlength: 1,
    },
    ngaySinh: {
      type: Date,
      default: null,
    },
    phai: {
      type: String,
      enum: [...Object.values(PHAI), null],
      default: null,
    },
    diaChi: {
      type: String,
      trim: true,
      default: null,
    },
    dienThoai: {
      type: String,
      required: [true, 'So dien thoai la bat buoc'],
      trim: true,
      minlength: [8, 'So dien thoai phai co it nhat 8 ky tu'],
    },
    trangThaiQuyenMuon: {
      type: String,
      required: true,
      enum: Object.values(TRANG_THAI_QUYEN_MUON),
      default: TRANG_THAI_QUYEN_MUON.DUOC_MUON,
    },
    lyDoHanCheMuon: {
      type: String,
      default: null,
    },
    soSachDangMuon: {
      type: Number,
      required: true,
      min: [0, 'So sach dang muon khong duoc am'],
      default: 0,
    },
    tongTienPhatChuaTra: {
      type: Number,
      required: true,
      min: [0, 'Tong tien phat chua tra khong duoc am'],
      default: 0,
    },
    trangThaiHoSo: {
      type: String,
      required: true,
      enum: Object.values(TRANG_THAI_HO_SO_DOC_GIA),
      default: TRANG_THAI_HO_SO_DOC_GIA.HOAT_DONG,
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
    collection: TEN_COLLECTION.DOC_GIA,
    versionKey: false,
    timestamps: {
      createdAt: 'ngayTao',
      updatedAt: 'ngayCapNhat',
    },
  }
);

docGiaSchema.index(
  { taiKhoanId: 1 },
  { unique: true, name: 'idx_doc_gia_tai_khoan_unique' }
);
docGiaSchema.index(
  { maDocGia: 1 },
  { unique: true, name: 'idx_doc_gia_ma_doc_gia_unique' }
);
docGiaSchema.index({ dienThoai: 1 }, { name: 'idx_doc_gia_dien_thoai' });
docGiaSchema.index({ hoLot: 1, ten: 1 }, { name: 'idx_doc_gia_ho_ten' });
docGiaSchema.index(
  { trangThaiQuyenMuon: 1, trangThaiHoSo: 1 },
  { name: 'idx_doc_gia_quyen_muon_ho_so' }
);

const DocGia = mongoose.model('DocGia', docGiaSchema);

module.exports = DocGia;

import mongoose from 'mongoose';

const inventoryMovementSchema = new mongoose.Schema(
  {
    inventoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inventory',
      required: true,
      index: true
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
      index: true
    },
    userId: {
      type: String,
      default: null,
      index: true
    },
    tipo: {
      type: String,
      enum: ['ENTRADA', 'SALIDA'],
      required: true,
      index: true
    },
    motivo: {
      type: String,
      enum: [
        'ORDER_EN_PREPARACION',
        'ORDER_CANCELADA',
        'ROLLBACK_DESCUENTO',
        'AJUSTE_MANUAL'
      ],
      required: true,
      index: true
    },
    cantidad: {
      type: Number,
      required: true,
      min: 0
    },
    stockAntes: {
      type: Number,
      required: true,
      min: 0
    },
    stockDespues: {
      type: Number,
      required: true,
      min: 0
    },
    metadata: {
      type: Object,
      default: {}
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

inventoryMovementSchema.index({ createdAt: -1 });
inventoryMovementSchema.index({ restaurantId: 1, createdAt: -1 });
inventoryMovementSchema.index({ inventoryId: 1, createdAt: -1 });

export default mongoose.model('InventoryMovement', inventoryMovementSchema);

import mongoose from 'mongoose';

export const topPlatos = async (req, res, next) => {
    try {
        const resultado = await mongoose.model('Mesa').aggregate([
            { $match: { estado: 'CERRADA' } },

            { $unwind: '$platos' },

            {
                $group: {
                    _id: '$platos.plato',
                    nombre: { $first: '$platos.nombre' },
                    totalVendidos: { $sum: '$platos.cantidad' },
                    ingresos: {
                        $sum: {
                            $multiply: ['$platos.cantidad', '$platos.precio']
                        }
                    }
                }
            },

            { $sort: { totalVendidos: -1 } },
            { $limit: 5 }
        ]);

        res.status(200).json({
            success: true,
            message: 'Top 5 platos más vendidos',
            data: resultado
        });

    } catch (error) {
        next(error);
    }
};

export const ingresosPorFecha = async (req, res, next) => {
    try {
        const { start, end } = req.query;

        if (!start || !end) {
            return res.status(400).json({
                success: false,
                message: 'Debe enviar fecha inicio y fin'
            });
        }

        const inicio = new Date(start);
        const fin = new Date(end);

        const resultado = await mongoose.model('Mesa').aggregate([
            {
                $match: {
                    estado: 'CERRADA',
                    createdAt: { $gte: inicio, $lte: fin }
                }
            },
            {
                $group: {
                    _id: null,
                    totalIngresos: { $sum: '$total' },
                    totalMesas: { $sum: 1 },
                    promedioCuenta: { $avg: '$total' }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            message: 'Ingresos por rango de fechas',
            data: resultado[0] || {
                totalIngresos: 0,
                totalMesas: 0,
                promedioCuenta: 0
            }
        });

    } catch (error) {
        next(error);
    }
};

export const horariosOcupacion = async (req, res, next) => {
    try {
        const resultado = await mongoose.model('Mesa').aggregate([
            { $match: { estado: 'CERRADA' } },

            {
                $project: {
                    hora: { $hour: '$createdAt' }
                }
            },
            {
                $group: {
                    _id: '$hora',
                    totalMesas: { $sum: 1 }
                }
            },
            { $sort: { totalMesas: -1 } }
        ]);

        res.status(200).json({
            success: true,
            message: 'Horarios de mayor ocupación',
            data: resultado
        });

    } catch (error) {
        next(error);
    }
};
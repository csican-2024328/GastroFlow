import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './src/Order/order.model.js';
import Restaurant from './src/Restaurant/Restaurant.model.js';
import Mesa from './src/Mesas/mesa.model.js';
import Inventory from './src/Inventory/inventory.model.js';
import Plato from './src/Platos/platos-model.js';

dotenv.config();

/**
 * Script temporal de prueba para insertar datos y verificar reportes
 * Ejecutar: node x.js
 * Eliminar después de validar que funcionen los reportes
 */

async function seedTestData() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Obtener o crear restaurante de prueba
    let restaurante = await Restaurant.findOne({ name: 'Restaurante Test' });
    if (!restaurante) {
      restaurante = await Restaurant.create({
        name: 'Restaurante Test',
        category: 'Comida Rápida',
        description: 'Restaurante de prueba para validar reportes',
        email: `test-${Date.now()}@test.com`,
        phone: '12345678',
        address: 'Calle Test 123',
        city: 'San Salvador',
        openingHours: '08:00 - 22:00',
        aforoMaximo: 50,
        isActive: true
      });
      console.log('✅ Restaurante de prueba creado:', restaurante._id);
    }

    // Obtener o crear mesa de prueba
    let mesa = await Mesa.findOne({ numero: 1, restaurantID: restaurante._id });
    if (!mesa) {
      mesa = await Mesa.create({
        numero: 1,
        ubicacion: 'Esquina A',
        capacidad: 4,
        restaurantID: restaurante._id,
        isActive: true
      });
      console.log('✅ Mesa de prueba creada:', mesa._id);
    }

    // Crear ingredientes de prueba
    const ingredientes = await Inventory.insertMany([
      { nombre: 'Tomate', stock: 100, unidadMedida: 'kg', activo: true },
      { nombre: 'Lechuga', stock: 50, unidadMedida: 'kg', activo: true },
      { nombre: 'Pollo', stock: 30, unidadMedida: 'kg', activo: true },
      { nombre: 'Queso', stock: 20, unidadMedida: 'kg', activo: true }
    ], { ordered: false }).catch(() => []);
    
    console.log('✅ Ingredientes de prueba creados');

    // Crear platos de prueba
    const platosCreados = await Plato.insertMany([
      {
        nombre: 'Ensalada César',
        descripcion: 'Ensalada fresca',
        precio: 8.50,
        categoria: 'ENTRADA',
        ingredientes: ingredientes.slice(0, 2).map(i => i._id),
        restaurantID: restaurante._id,
        isActive: true,
        disponible: true
      },
      {
        nombre: 'Pollo a la Parrilla',
        descripcion: 'Pollo jugoso',
        precio: 15.00,
        categoria: 'FUERTE',
        ingredientes: [ingredientes[2]._id],
        restaurantID: restaurante._id,
        isActive: true,
        disponible: true
      },
      {
        nombre: 'Quesadilla',
        descripcion: 'Quesadilla con queso',
        precio: 10.00,
        categoria: 'FUERTE',
        ingredientes: [ingredientes[3]._id],
        restaurantID: restaurante._id,
        isActive: true,
        disponible: true
      }
    ], { ordered: false }).catch(() => []);
    
    console.log('✅ Platos de prueba creados');

    // Crear 5 órdenes de prueba con estado ENTREGADO
    const ordenes = [];
    for (let i = 0; i < 5; i++) {
      const orden = {
        numeroOrden: `TEST-${Date.now()}-${i}`,
        tipoPedido: 'EN_MESA',
        restaurantID: restaurante._id,
        mesaID: mesa._id,
        clienteNombre: `Cliente Prueba ${i + 1}`,
        clienteTelefono: `5555000${i}`,
        items: [
          {
            tipo: 'PLATO',
            plato: platosCreados[i % platosCreados.length]._id,
            nombre: platosCreados[i % platosCreados.length].nombre,
            cantidad: 1 + (i % 2),
            precioUnitario: platosCreados[i % platosCreados.length].precio,
            subtotal: (1 + (i % 2)) * platosCreados[i % platosCreados.length].precio
          }
        ],
        subtotal: (1 + (i % 2)) * platosCreados[i % platosCreados.length].precio,
        impuesto: 0,
        descuento: 0,
        total: (1 + (i % 2)) * platosCreados[i % platosCreados.length].precio,
        estado: 'ENTREGADO',
        metodoPago: 'EFECTIVO',
        horaEntrega: new Date(),
        isActive: true
      };

      ordenes.push(orden);
    }

    await Order.insertMany(ordenes);
    console.log('✅ 5 órdenes de prueba creadas con estado ENTREGADO');

    console.log('\n✅ Datos de prueba inseridos correctamente');
    console.log('\nAhora puedes probar los endpoints de reportes:');
    console.log('- GET /api/v1/reports/top-platos');
    console.log('- GET /api/v1/reports/clientes-frecuentes?restaurantID=' + restaurante._id);
    console.log('- GET /api/v1/reports/ocupacion?restaurantID=' + restaurante._id);
    console.log('- GET /api/v1/reports/exportar/pdf');
    console.log('\nRecuerda eliminar este archivo (x.js) después de probar');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedTestData();

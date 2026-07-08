const parseDateTime = (fechaReserva, hora) => {
    const reservationDate = new Date(fechaReserva);
    const [hours, minutes] = String(hora).split(':').map(Number);
    const dateTime = new Date(reservationDate);
    dateTime.setHours(hours, minutes, 0, 0);
    return dateTime;
};

console.log('overlap:', parseDateTime('2026-05-27', '17:38') < parseDateTime('2026-05-27', '23:38') && parseDateTime('2026-05-27', '23:38') > parseDateTime('2026-05-27', '17:38'));

module.exports = (sequelize, DataTypes) => {
  const Appointment = sequelize.define('Appointment', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    patientId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    doctorId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    time: { type: DataTypes.TIME, allowNull: false },
    status: { type: DataTypes.ENUM('pending','approved','cancelled','completed'), defaultValue: 'pending' }
  }, {});

  Appointment.associate = models => {
    Appointment.belongsTo(models.Patient, { foreignKey: 'patientId' });
    Appointment.belongsTo(models.Doctor, { foreignKey: 'doctorId' });
    Appointment.hasOne(models.Consultation, { foreignKey: 'appointmentId' });
  };

  return Appointment;
};

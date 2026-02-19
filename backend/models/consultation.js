module.exports = (sequelize, DataTypes) => {
  const Consultation = sequelize.define('Consultation', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    appointmentId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    doctorId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    patientId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    diagnosis: { type: DataTypes.TEXT, allowNull: true },
    prescription: { type: DataTypes.TEXT, allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
    fileUrl: { type: DataTypes.STRING, allowNull: true }
  }, {});

  Consultation.associate = models => {
    Consultation.belongsTo(models.Appointment, { foreignKey: 'appointmentId' });
    Consultation.belongsTo(models.Doctor, { foreignKey: 'doctorId' });
    Consultation.belongsTo(models.Patient, { foreignKey: 'patientId' });
  };

  return Consultation;
};

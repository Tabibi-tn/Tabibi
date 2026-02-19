module.exports = (sequelize, DataTypes) => {
  const Patient = sequelize.define('Patient', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false }
  }, {});

  Patient.associate = models => {
    Patient.belongsTo(models.User, { foreignKey: 'userId' });
    Patient.hasMany(models.Appointment, { foreignKey: 'patientId' });
    Patient.hasMany(models.Consultation, { foreignKey: 'patientId' });
    Patient.hasMany(models.Review, { foreignKey: 'patientId' });
  };

  return Patient;
};

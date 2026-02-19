module.exports = (sequelize, DataTypes) => {
  const Doctor = sequelize.define('Doctor', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    specialtyId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    experience: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    clinicAddress: { type: DataTypes.STRING, allowNull: true },
    fee: { type: DataTypes.DECIMAL(10,2), allowNull: true },
    licenseNumber: { type: DataTypes.STRING, allowNull: true },
    status: { type: DataTypes.ENUM('pending','approved'), defaultValue: 'pending' }
    ,
    availability: { type: DataTypes.JSON, allowNull: true }
  }, {});

  Doctor.associate = models => {
    Doctor.belongsTo(models.User, { foreignKey: 'userId' });
    Doctor.belongsTo(models.Specialty, { foreignKey: 'specialtyId' });
    Doctor.hasMany(models.Appointment, { foreignKey: 'doctorId' });
    Doctor.hasMany(models.Consultation, { foreignKey: 'doctorId' });
    Doctor.hasMany(models.Review, { foreignKey: 'doctorId' });
  };

  return Doctor;
};

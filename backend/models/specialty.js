module.exports = (sequelize, DataTypes) => {
  const Specialty = sequelize.define('Specialty', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false }
  }, {});

  Specialty.associate = models => {
    Specialty.hasMany(models.Doctor, { foreignKey: 'specialtyId' });
  };

  return Specialty;
};

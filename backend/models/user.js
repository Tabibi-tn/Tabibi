module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM('patient','doctor','admin'), allowNull: false, defaultValue: 'patient' },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
  }, {});

  User.associate = models => {
    User.hasOne(models.Doctor, { foreignKey: 'userId' });
    User.hasOne(models.Patient, { foreignKey: 'userId' });
  };

  return User;
};

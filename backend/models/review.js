module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define('Review', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    patientId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    doctorId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    rating: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, validate: { min:1, max:5 } },
    comment: { type: DataTypes.TEXT, allowNull: true }
  }, {});

  Review.associate = models => {
    Review.belongsTo(models.Patient, { foreignKey: 'patientId' });
    Review.belongsTo(models.Doctor, { foreignKey: 'doctorId' });
  };

  return Review;
};

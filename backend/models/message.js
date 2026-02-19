module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    senderId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    receiverId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    appointmentId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true }
  }, {});

  Message.associate = models => {
    Message.belongsTo(models.User, { as: 'sender', foreignKey: 'senderId' });
    Message.belongsTo(models.User, { as: 'receiver', foreignKey: 'receiverId' });
  };

  return Message;
};

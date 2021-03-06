/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('routine', {
    id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
    },
    exerciseCode: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Exercise',
        key: 'exerciseCode'
      }
    },
    scheduleId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Schedule',
        key: 'id'
      }
    },
    memberId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'Schedule',
        key: 'memberId'
      }
    },
    routineOrder: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    isCardio: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    cardioTime: {
      type: DataTypes.TIME,
      allowNull: false
    }
  }, {
    tableName: 'Routine'
  });
};

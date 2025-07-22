const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const GovernmentContract = sequelize.define('GovernmentContract', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    agency_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Agency name is required'
        },
        len: {
          args: [2, 255],
          msg: 'Agency name must be between 2 and 255 characters'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Description is required'
        },
        len: {
          args: [10, 2000],
          msg: 'Description must be between 10 and 2000 characters'
        }
      }
    },
    logo_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: {
          msg: 'Logo URL must be a valid URL'
        }
      }
    },
    display_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: 'Display order must be a positive number'
        }
      }
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'government_contracts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['display_order']
      },
      {
        fields: ['is_active']
      },
      {
        fields: ['agency_name']
      }
    ]
  });

  // Instance methods
  GovernmentContract.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    
    // Format dates
    if (values.created_at) {
      values.created_at = new Date(values.created_at).toISOString();
    }
    if (values.updated_at) {
      values.updated_at = new Date(values.updated_at).toISOString();
    }
    
    return values;
  };

  // Class methods
  GovernmentContract.getActiveContracts = function() {
    return this.findAll({
      where: {
        is_active: true
      },
      order: [['display_order', 'ASC'], ['created_at', 'DESC']]
    });
  };

  GovernmentContract.getNextDisplayOrder = async function() {
    const maxOrder = await this.max('display_order');
    return (maxOrder || 0) + 1;
  };

  return GovernmentContract;
};

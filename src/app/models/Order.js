import Sequelize, { Model } from 'sequelize';
import { isBefore } from 'date-fns';

class Order extends Model {
  static init(sequelize) {
    super.init(
      {
        product: Sequelize.STRING,
        start_date: Sequelize.DATE,
        end_date: Sequelize.DATE,
        canceled_at: Sequelize.STRING,
        past: {
          type: Sequelize.VIRTUAL,
          get() {
            return isBefore(this.end_date, new Date());
          },
        },
      },
      { sequelize }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.File, {
      foreignKey: 'signature_id',
      as: 'signature',
    });
    this.belongsTo(models.Deliveryman, {
      foreignKey: 'deliveryman_id',
      as: 'deliveryman',
    });
    this.belongsTo(models.Recipient, {
      foreignKey: 'recipient_id',
      as: 'recipient',
    });
  }
}
export default Order;

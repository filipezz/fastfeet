import Mail from '../../lib/mail';

class CancellationMail {
  get key() {
    return 'CancellationMail';
  }

  async handle({ data }) {
    const { order } = data;

    console.log('A fila executou');

    await Mail.sendMail({
      to: `${order.deliveryman.name} <${order.deliveryman.email}>`,
      subject: 'Entrega cancelada',
      template: 'cancellation',
      context: {
        deliveryman: order.deliveryman.name,
        clientName: order.recipient.name,
        product: order.product,
        street: order.recipient.street,
        number: order.recipient.number,
        city: order.recipient.city,
        state: order.recipient.state,
        zip: order.recipient.zip,
      },
    });
  }
}

export default new CancellationMail();

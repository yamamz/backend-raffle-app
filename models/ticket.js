module.exports = (sequelize, DataTypes) => {
    const Tickets = sequelize.define("Tickets", {
        ticketNumber: {
            type: DataTypes.BIGINT,
            allowNull: false,
            unique: true
        },
        isFree: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        isSaleOnline: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }


    });
    Tickets.associate = models => {
        Tickets.belongsTo(models.Users);
        Tickets.belongsTo(models.Draws);
    }

    return Tickets;
};
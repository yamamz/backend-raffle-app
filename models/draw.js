module.exports = (sequelize, DataTypes) => {
    const Draws = sequelize.define("Draws", {
        description: {
            type: DataTypes.STRING
        },
        startPeriodDate: {
            type: DataTypes.DATE,
            allowNull: false
        },

        drawDate: {
            type: DataTypes.DATE,
            allowNull: false
        },
        ticketPrice: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        licence: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        numberOfTickets: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }

    });
    Draws.associate = models => {
        Draws.hasMany(models.Tickets);
    }

    return Draws;
};
module.exports = (sequelize, DataTypes) => {
    const Donations = sequelize.define("Donations", {
        fullname: {
            type: DataTypes.STRING
        },
        address: {
            type: DataTypes.STRING
        },
        phone: {
            type: DataTypes.STRING
        },
        email: {
            type: DataTypes.STRING
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
    });

    return Donations;
};
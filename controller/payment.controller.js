const db = require("./../models");
const config = require("./../config/auth.config");
const User = db.user;
const Role = db.role;
const express = require('express')
const paymentRoute = express.Router()
const { authJwt } = require("../middleware");
const nodemailer = require('nodemailer');

const keys = require('./../config/keys');
const stripe = require('stripe')(keys.stripeSecretKey);
const payment = async (req, res) => {

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
        amount: req.body.ticketPcs * 5 * 100,
        currency: "cad"
    });
    res.send({
        setupIntent: paymentIntent
    });
}

const cancelCheckout = async (req, res) => {
    try {

        const setupIntent = await stripe.paymentIntents.cancel(
            req.body.setupIntentId
        );
        res.send(setupIntent)
    } catch (err) {
        res.status(500).send({ message: 'there is an error occured when cancelling' })
    }

}

paymentRoute.post(
    "/ckeckoutPayment",
    [authJwt.verifyToken],
    payment
);

paymentRoute.post(
    "/checkoutCancel",
    [authJwt.verifyToken],
    cancelCheckout
);


paymentRoute.post(
    "/sendEmailReciept",
    [authJwt.verifyToken],
    async (req, res) => {
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'draw.meditationgarden@gmail.com',
                    pass: 'ibflfiookahrfeok' // naturally, replace both with your real credentials or an application-specific password
                }
            });

            let htmlBody = `<h1><b>Thank you for joining the fundraising raffle draw</b></h1>
           <p>Please see attatched document for the copy of your ticket</p>
            `;
            const mailOptions = {
                from: 'draw.meditationgarden@gmail.com',
                to: req.body.email,
                subject: 'Ticket purchased confirmation',
                html: htmlBody,
                attachments: [
                    {   // encoded string as an attachment
                        filename: 'tickets.pdf',
                        content: req.body.ticketBase64,
                        encoding: 'base64'
                    }
                ]
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    res.status(500).send({ success: false })
                } else {
                    res.send({ success: true })
                }
            });
        } catch (err) {
            res.status(500).send({ success: false })
        }

    }
);






module.exports = paymentRoute
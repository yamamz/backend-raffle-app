const express = require('express')
const ticketRoute = express.Router()
const db = require('./../models')
const { authJwt } = require("../middleware");
const Sequelize = require('sequelize');
const PdfMakePrinter = require('pdfmake/src/printer');
var fs = require('fs');
// const pdfMake = require("pdfmake/build/pdfmake");
// const pdfFonts = require("pdfmake/build/vfs_fonts");
// pdfMake.vfs = pdfFonts.pdfMake.vfs;

const makeid = (length) => {
    var result = "";
    var characters = "ABCDEFGHIJKLMNPQRSTUVWXYZ0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
        );
    }
    return result;
}



const generatePdf = (docDefinition, callback) => {
    try {
        var fonts = {
            Roboto: {
                normal: 'fonts/Roboto-Regular.ttf',
                bold: 'fonts/Roboto-Medium.ttf',
                italics: 'fonts/Roboto-Italic.ttf',
                bolditalics: 'fonts/Roboto-MediumItalic.ttf'
            }
        };


        var printer = new PdfMakePrinter(fonts);
        var pdfDoc = printer.createPdfKitDocument(docDefinition);
        let chunks = [];

        pdfDoc.on('data', (chunk) => {
            chunks.push(chunk);
        });

        pdfDoc.on('end', () => {
            callback(Buffer.concat(chunks));
        });

        pdfDoc.end()

    } catch (err) {
        throw (err);
    }
};

ticketRoute.post('/generatePdf', (req, res) => {
    try {
        generatePdf(req.body.docDefinition, (responsePdf) => {

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', '"attachment; filename=" + document.pdf');
            console.log('here');
            res.send(responsePdf);
        });

    } catch (err) {
        return res.status(500).send(err.message);
    }

})




ticketRoute.post('/generateOffTicket', [authJwt.verifyToken, authJwt.isModerator], async (req, res) => {
    try {

        let tickets = [];
        const maxTicketId = await db.Tickets.findAll({
            attributes: [Sequelize.fn('max', Sequelize.col('id'))],
            raw: true,
        })
        let startId = 0;

        if (maxTicketId.length > 0) {
            startId = Object.values(maxTicketId[0])[0]
        }

        for (let i = 1; i <= req.body.ticketPcs; i++) {
            startId++
            tickets.push({
                ticketNumber:
                    makeid(6) +
                    "-" +
                    startId,
                isFree: false,
                UserId: req.body.userId,
                DrawId: req.body.drawId,
                isSaleOnline: false,
                soldOut: false,
            });
        }
        await db.Tickets.bulkCreate(tickets);
        const ticketsByDraw = await db.Tickets.findAll(
            {
                where: { DrawId: req.body.drawId },
                include: [
                    {
                        model: db.Draws,
                    },
                    {
                        model: db.Users,
                    },
                ]
            }
        );
        return res.status(200).json({ tickets: ticketsByDraw });
    } catch (error) {
        return res.status(500).send(error.message);
    }

})
ticketRoute.post('/validate-tickets', [authJwt.verifyToken, authJwt.isModerator], async (req, res) => {
    try {
        console.log(req.body)
        await db.Tickets.update({ soldOut: true }, {
            where: {
                id: {
                    [Sequelize.Op.in]: req.body
                }
            }
        });
        res.send({ message: 'success' })
    } catch (error) {
        return res.status(500).send(error.message);
    }

})


ticketRoute.get('/getAll', [authJwt.verifyToken, authJwt.isModerator], async (req, res) => {
    try {

        const tickets = await db.Tickets.findAll(
            {
                include: [
                    {
                        model: db.Draws,
                    },
                    {
                        model: db.Users,
                    },
                ]
            }
        );
        return res.status(200).json({ tickets });
    } catch (error) {
        return res.status(500).send(error.message);
    }
})

ticketRoute.get('/getAllByDraw/:id', [authJwt.verifyToken, authJwt.isModerator], async (req, res) => {
    try {

        const maxTickets = await db.Tickets.findAll({
            attributes: [Sequelize.fn('max', Sequelize.col('id'))],
            raw: true,
        })

        const { id } = req.params;
        const tickets = await db.Tickets.findAll(
            {
                where: { DrawId: id },
                include: [
                    {
                        model: db.Draws,
                    },
                    {
                        model: db.Users,
                    },
                ]
            }
        );
        return res.status(200).json({ tickets });
    } catch (error) {
        return res.status(500).send(error.message);
    }
})

ticketRoute.get('/getAllByUser/:id', [authJwt.verifyToken], async (req, res) => {
    try {
        const { id } = req.params;
        const tickets = await db.Tickets.findAll(
            {
                where: { UserId: id },
                include: [
                    {
                        model: db.Draws,
                    },
                    {
                        model: db.Users,
                    },
                ]
            }
        );
        return res.status(200).json({ tickets });
    } catch (error) {
        return res.status(500).send(error.message);
    }
})



ticketRoute.get('/:id', [authJwt.verifyToken, authJwt.isModerator], async (req, res) => {
    try {
        const { id } = req.params;
        const ticket = await db.Tickets.findOne({
            where: { id: id }
        });
        if (ticket) {
            return res.status(200).json({ ticket });
        }
        return res.status(404).send('ticket with the specified ID does not exists');
    } catch (error) {
        return res.status(500).send(error.message);
    }
})

ticketRoute.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await db.Tickets.destroy({
            where: { id: id }
        });
        if (deleted) {
            return res.status(204).send("ticket deleted");
        }
        throw new Error("ticket not found");
    } catch (error) {
        return res.status(500).send(error.message);
    }
})

ticketRoute.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await db.Tickets.update(req.body, {
            where: { id: id }
        });
        if (updated) {
            const updatedticket = await db.Tickets.findOne({ where: { id: id } });
            return res.status(200).json({ ticket: updatedticket });
        }
        throw new Error('ticket not found');
    } catch (error) {
        return res.status(500).send(error.message);
    }
})

module.exports = ticketRoute


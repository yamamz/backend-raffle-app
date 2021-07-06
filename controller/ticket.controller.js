const express = require('express')
const ticketRoute = express.Router()
const db = require('./../models')
const { authJwt } = require("../middleware");
ticketRoute.post('/new', [authJwt.verifyToken], async (req, res) => {
    try {
        await db.Tickets.bulkCreate(req.body);
        const tickets = await db.Tickets.findAll();
        res.send(tickets)
    } catch (error) {
        return res.status(500).send(error.message);
    }

})
ticketRoute.post('/validate-tickets', [authJwt.verifyToken, authJwt.isModerator], async (req, res) => {
    try {
        await db.Tickets.update({ soldOut: true }, {
            where: {
                id: {
                    $in: req.body
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


const db = require("./../models");
const config = require("./../config/auth.config");
const User = db.user;
const Role = db.role;
const express = require('express')
const authRoute = express.Router()
const { verifySignUp, authJwt } = require("../middleware");

const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

const signup = (req, res) => {
    // Save User to Database
    User.create({
        username: req.body.username,
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        address: req.body.address,
        contact: req.body.contact,
        password: bcrypt.hashSync(req.body.password, 8)
    })
        .then(user => {
            if (req.body.roles) {
                Role.findAll({
                    where: {
                        name: {
                            [Op.or]: req.body.roles
                        }
                    }
                }).then(roles => {
                    user.setRoles(roles).then(() => {
                        res.send({ message: "User was registered successfully!" });
                    });
                });
            } else {
                // user role = 1
                user.setRoles([1]).then(() => {
                    res.send({ message: "User was registered successfully!" });
                });
            }
        })
        .catch(err => {
            res.status(500).send({ message: err.message });
        });
};

const signin = (req, res) => {
    User.findOne({
        where: {
            username: req.body.username
        }
    })
        .then(user => {
            if (!user) {
                return res.status(404).send({ message: "User Not found." });
            }

            var passwordIsValid = bcrypt.compareSync(
                req.body.password,
                user.password
            );

            if (!passwordIsValid) {
                return res.status(401).send({
                    accessToken: null,
                    message: "Invalid Password!"
                });
            }

            var token = jwt.sign({ id: user.id }, config.secret, {
                expiresIn: 86400 // 24 hours
            });

            var authorities = [];
            user.getRoles().then(roles => {
                for (let i = 0; i < roles.length; i++) {
                    authorities.push("ROLE_" + roles[i].name.toUpperCase());
                }
                res.status(200).send({
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    roles: authorities,
                    accessToken: token
                });
            });
        })
        .catch(err => {
            res.status(500).send({ message: err.message });
        });
};

const userContent = (req, res) => {
    User.findOne({
        where: { id: req.userId },
        attributes: ['id', 'username', 'email', 'firstName', 'lastName', 'address', 'contact'],
        include: [
            {
                model: Role,
                attributes: ['id', 'name'],
                through: {
                    attributes: ['userId', 'roleId'],
                }
            }
        ]
    }).then(user => {
        res.status(200).json({
            "description": "User Content Page",
            "user": user
        });
    }).catch(err => {
        res.status(500).json({
            "description": "Can not access User Page",
            "error": err
        });
    })
}
authRoute.post(
    "/signup",
    [
        verifySignUp.checkDuplicateUsernameOrEmail,
        verifySignUp.checkRolesExisted
    ],
    signup
);

authRoute.post("/signin", signin);

authRoute.get("/session", [authJwt.verifyToken], userContent);

authRoute.get('/:id', [authJwt.verifyToken], async (req, res) => {
    try {
        const { id } = req.params;
        const user = await db.Users.findOne({
            where: { id: id },
            include: [
                {
                    model: db.Tickets,
                }
            ]
        });
        if (user) {
            return res.status(200).json({ user });
        }
        return res.status(404).send('user with the specified ID does not exists');
    } catch (error) {
        return res.status(500).send(error.message);
    }
})

authRoute.post('/logout', [authJwt.verifyToken], async (req, res) => {
    try {
        let randomNumberToAppend = toString(Math.floor((Math.random() * 1000) + 1));
        let randomIndex = Math.floor((Math.random() * 10) + 1);
        let hashedRandomNumberToAppend = await bcrypt.hash(randomNumberToAppend, 10);

        // now just concat the hashed random number to the end of the token
        req.token = req.token + hashedRandomNumberToAppend;
        return res.status(200).json('logout');
    } catch (err) {
        return res.status(500).json(err.message);
    }
});
module.exports = authRoute

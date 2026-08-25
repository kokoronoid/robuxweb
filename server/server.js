const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");

const app = express();

const PORT = 3000;

const JWT_SECRET = "ROBuxStore_SECRET_GANTI_NANTI";


// =====================
// MIDDLEWARE
// =====================

app.use(cors());

app.use(express.json());

const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },

    filename: (req, file, cb) => {

        const extension =
            path.extname(file.originalname);

        cb(
            null,
            `proof-${Date.now()}${extension}`
        );
    }

});


const upload = multer({

    storage: storage,

    limits: {
        fileSize: 5 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (
            allowedTypes.includes(file.mimetype)
        ) {

            cb(null, true);

        } else {

            cb(
                new Error(
                    "File harus JPG, PNG, atau WEBP."
                )
            );

        }
    }

});


app.use(
    "/uploads",
    express.static(
        path.join(__dirname, "uploads")
    )
);


// =====================
// MYSQL
// =====================

const db = mysql.createPool({

    host: "localhost",

    user: "root",

    password: "",

    database: "robuxstore",

    waitForConnections: true,

    connectionLimit: 10,

    queueLimit: 0

});


// =====================
// TEST BACKEND
// =====================

app.get("/", (req, res) => {

    res.send(
        "Backend RobuxStore berhasil berjalan!"
    );

});


// =====================
// GET PRODUCTS
// =====================

app.get(
    "/api/products",
    async (req, res) => {

        try {

            const [products] =
                await db.execute(
                    "SELECT * FROM products"
                );

            res.json(products);

        } catch (error) {

            console.error(error);

            res.status(500).json({
                message:
                    "Gagal mengambil produk."
            });

        }

    }
);


// =====================
// CREATE ORDER
// =====================

app.post(
    "/api/orders",
    async (req, res) => {

        try {

            const {
                username,
                product_id,
                payment
            } = req.body;


            if (
                !username ||
                !product_id ||
                !payment
            ) {

                return res.status(400).json({
                    message:
                        "Data order belum lengkap."
                });

            }


            const [products] =
                await db.execute(

                    "SELECT * FROM products WHERE id = ?",

                    [product_id]

                );


            if (products.length === 0) {

                return res.status(404).json({
                    message:
                        "Produk tidak ditemukan."
                });

            }


            const product =
                products[0];


            const [result] =
                await db.execute(

                    `INSERT INTO orders
                    (
                        username,
                        product_id,
                        robux,
                        price,
                        payment,
                        status
                    )
                    VALUES (?, ?, ?, ?, ?, ?)`,

                    [
                        username,
                        product.id,
                        product.robux,
                        product.price,
                        payment,
                        "PENDING"
                    ]

                );


            res.json({

                message:
                    "Order berhasil dibuat.",

                orderId:
                    result.insertId

            });


        } catch (error) {

            console.error(error);

            res.status(500).json({

                message:
                    "Gagal membuat order."

            });

        }

    }
);


// =====================
// GET ALL ORDERS
// =====================

app.get(
    "/api/orders",
    verifyAdmin,
    async (req, res) => {

        try {

            const [orders] =
                await db.execute(

                    `SELECT *
                     FROM orders
                     ORDER BY id DESC`

                );

            res.json(orders);

        } catch (error) {

            console.error(error);

            res.status(500).json({

                message:
                    "Gagal mengambil order."

            });

        }

    }
);


// =====================
// GET ORDER BY ID
// =====================

app.get(
    "/api/orders/:id",
    async (req, res) => {

        try {

            const orderId =
                req.params.id;


            const [orders] =
                await db.execute(

                    `SELECT
                        id,
                        username,
                        robux,
                        price,
                        payment,
                        status,
                        created_at
                     FROM orders
                     WHERE id = ?`,

                    [orderId]

                );


            if (orders.length === 0) {

                return res.status(404).json({

                    message:
                        "Order tidak ditemukan."

                });

            }


            res.json(orders[0]);


        } catch (error) {

            console.error(error);

            res.status(500).json({

                message:
                    "Gagal mengambil order."

            });

        }

    }
);


// =====================
// ADMIN LOGIN
// =====================

app.post(
    "/api/admin/login",
    (req, res) => {

        const {
            username,
            password
        } = req.body;


        if (
            username !== "admin" ||
            password !== "admin123"
        ) {

            return res.status(401).json({

                message:
                    "Username atau password salah."

            });

        }


        const token =
            jwt.sign(

                {
                    role: "admin"
                },

                JWT_SECRET,

                {
                    expiresIn: "2h"
                }

            );


        res.json({

            message:
                "Login berhasil.",

            token:
                token

        });

    }
);


// =====================
// ADMIN AUTH
// =====================

function verifyAdmin(
    req,
    res,
    next
) {

    const authHeader =
        req.headers.authorization;


    if (!authHeader) {

        return res.status(401).json({

            message:
                "Akses ditolak."

        });

    }


    const token =
        authHeader.split(" ")[1];


    try {

        const decoded =
            jwt.verify(
                token,
                JWT_SECRET
            );


        if (
            decoded.role !== "admin"
        ) {

            return res.status(403).json({

                message:
                    "Bukan admin."

            });

        }


        next();


    } catch (error) {

        return res.status(401).json({

            message:
                "Token tidak valid atau sudah expired."

        });

    }

}


// =====================
// UPDATE ORDER STATUS
// =====================

app.put(
    "/api/orders/:id/status",
    verifyAdmin,
    async (req, res) => {

        try {

            const orderId =
                req.params.id;

            const {
                status
            } = req.body;


            const allowedStatuses = [

                "PENDING",

                "PROCESSING",

                "COMPLETED",

                "CANCELLED"

            ];


            if (
                !allowedStatuses.includes(
                    status
                )
            ) {

                return res.status(400).json({

                    message:
                        "Status tidak valid."

                });

            }


            const [result] =
                await db.execute(

                    `UPDATE orders
                     SET status = ?
                     WHERE id = ?`,

                    [
                        status,
                        orderId
                    ]

                );


            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({

                    message:
                        "Order tidak ditemukan."

                });

            }


            res.json({

                message:
                    "Status berhasil diubah.",

                status:
                    status

            });


        } catch (error) {

            console.error(error);

            res.status(500).json({

                message:
                    "Gagal mengubah status."

            });

        }

    }
);

// =====================
// UPLOAD PAYMENT PROOF
// =====================

app.post(
    "/api/orders/:id/proof",
    upload.single("proof"),
    async (req, res) => {

        try {

            const orderId = req.params.id;

            if (!req.file) {

                return res.status(400).json({
                    message:
                        "Bukti pembayaran wajib diupload."
                });

            }

            const [orders] = await db.execute(
                `SELECT id, status
                 FROM orders
                 WHERE id = ?`,
                [orderId]
            );

            if (orders.length === 0) {

                return res.status(404).json({
                    message:
                        "Order tidak ditemukan."
                });

            }

            const order = orders[0];

            if (order.status === "COMPLETED") {

                return res.status(400).json({
                    message:
                        "Order ini sudah selesai."
                });

            }

            const filePath =
                `/uploads/${req.file.filename}`;

            await db.execute(
                `UPDATE orders
                 SET payment_proof = ?
                 WHERE id = ?`,
                [
                    filePath,
                    orderId
                ]
            );

            res.json({
                message:
                    "Bukti pembayaran berhasil diupload.",
                file:
                    filePath
            });

        } catch (error) {

            console.error(
                "UPLOAD ERROR:",
                error
            );

            res.status(500).json({
                message:
                    "Gagal mengupload bukti pembayaran."
            });

        }

    }
);

// =====================
// START SERVER
// =====================

app.listen(
    PORT,
    () => {

        console.log(
            `Server berjalan di http://localhost:${PORT}`
        );

        db.getConnection()
            .then(connection => {

                console.log(
                    "MySQL berhasil terhubung!"
                );

                connection.release();

            })
            .catch(error => {

                console.error(
                    "MySQL gagal terhubung:",
                    error.message
                );

            });

    }
);
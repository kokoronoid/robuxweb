// =====================
// API
// =====================

const API_URL = "http://localhost:3000";


// =====================
// LOAD PRODUCTS
// =====================

async function loadProducts() {

    try {

        const response = await fetch(
            `${API_URL}/api/products`
        );

        if (!response.ok) {
            throw new Error(
                "Gagal mengambil produk."
            );
        }

        const products =
            await response.json();

        const productList =
            document.getElementById(
                "product-list"
            );


        if (!productList) {
            return;
        }


        // Kosongkan produk lama
        productList.innerHTML = "";


        products.forEach(product => {

            const card =
                document.createElement("div");

            card.className =
                "product-card";


            card.innerHTML = `

                <p class="product-name">
                    Robux
                </p>

                <h3>
                    ${Number(product.robux)
                        .toLocaleString("id-ID")}
                    Robux
                </h3>

                <p class="product-price">
                    Rp${Number(product.price)
                        .toLocaleString("id-ID")}
                </p>

                <button
                    type="button"
                    onclick="selectProduct(
                        ${product.robux}
                    )"
                >
                    Beli Sekarang
                </button>

            `;


            productList.appendChild(card);

        });


        console.log(
            "Produk dari backend:",
            products
        );


    } catch (error) {

        console.error(
            "Gagal mengambil produk:",
            error
        );

    }

}


// =====================
// SELECT PRODUCT
// =====================

function selectProduct(robux) {

    const packageSelect =
        document.getElementById(
            "package"
        );


    if (!packageSelect) {
        return;
    }


    packageSelect.value =
        robux;


    changePackage();


    const checkout =
        document.querySelector(
            ".checkout"
        );


    if (checkout) {

        checkout.scrollIntoView({
            behavior: "smooth"
        });

    }

}


// =====================
// CHANGE PACKAGE
// =====================

async function changePackage() {

    const packageValue =
        document.getElementById(
            "package"
        ).value;


    const total =
        document.getElementById(
            "total"
        );


    if (!packageValue) {

        total.textContent =
            "Rp0";

        return;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/products`
            );


        if (!response.ok) {

            throw new Error(
                "Gagal mengambil produk."
            );

        }


        const products =
            await response.json();


        const product =
            products.find(
                product =>
                    Number(product.robux) ===
                    Number(packageValue)
            );


        if (!product) {

            total.textContent =
                "Rp0";

            return;

        }


        total.textContent =
            "Rp" +
            Number(product.price)
                .toLocaleString("id-ID");


    } catch (error) {

        console.error(
            "Gagal mengambil harga:",
            error
        );


        total.textContent =
            "Gagal mengambil harga";

    }

}


// =====================
// CREATE ORDER
// =====================

async function createOrder() {

    const username =
        document.getElementById(
            "username"
        ).value.trim();


    const packageValue =
        document.getElementById(
            "package"
        ).value;


    const payment =
        document.getElementById(
            "payment"
        ).value;


    // Validasi username

    if (!username) {

        alert(
            "Username Roblox wajib diisi!"
        );

        return;

    }


    // Validasi paket

    if (!packageValue) {

        alert(
            "Pilih paket Robux terlebih dahulu!"
        );

        return;

    }


    // Validasi pembayaran

    if (!payment) {

        alert(
            "Pilih metode pembayaran!"
        );

        return;

    }


    try {

        // =====================
        // AMBIL PRODUK DARI BACKEND
        // =====================

        const productsResponse =
            await fetch(
                `${API_URL}/api/products`
            );


        if (!productsResponse.ok) {

            throw new Error(
                "Gagal mengambil produk."
            );

        }


        const products =
            await productsResponse.json();


        // Cari produk

        const product =
            products.find(
                product =>
                    Number(product.robux) ===
                    Number(packageValue)
            );


        if (!product) {

            alert(
                "Produk tidak ditemukan."
            );

            return;

        }


        // =====================
        // BUAT ORDER
        // =====================

        const response =
            await fetch(
                `${API_URL}/api/orders`,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        username:
                            username,

                        product_id:
                            product.id,

                        payment:
                            payment

                    })

                }
            );


        const data =
            await response.json();


        // =====================
        // CEK RESPONSE
        // =====================

        if (!response.ok) {

            alert(
                data.message ||
                "Gagal membuat order."
            );

            return;

        }


        console.log(
            "Order berhasil:",
            data
        );


        // Simpan order ID

        localStorage.setItem(
            "lastOrderId",
            data.orderId
        );


        // =====================
        // BERHASIL
        // =====================

        alert(
            "Order berhasil dibuat!\n\n" +
            "Nomor Order: #" +
            data.orderId
        );


        // Masuk halaman pembayaran

        window.location.href =
            `payment.html?order=${data.orderId}`;


    } catch (error) {

        console.error(
            "Create order error:",
            error
        );


        alert(
            "Server tidak bisa dihubungi."
        );

    }

}


// =====================
// MOBILE MENU
// =====================

function toggleMenu() {

    const menu =
        document.querySelector(
            ".nav-menu"
        );


    if (!menu) {
        return;
    }


    menu.classList.toggle(
        "active"
    );

}


// =====================
// START
// =====================

loadProducts();
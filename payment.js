const API_URL =
    "plansstore-rbx.up.railway.app";


// =====================
// AMBIL ORDER ID
// =====================

const params =
    new URLSearchParams(
        window.location.search
    );

const orderId =
    params.get("order");


// =====================
// LOAD ORDER
// =====================

async function loadOrder() {

    const paymentInfo =
        document.getElementById(
            "paymentInfo"
        );


    if (!orderId) {

        paymentInfo.innerHTML = `
            <p>
                Nomor order tidak ditemukan.
            </p>
        `;

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/orders/${orderId}`
            );


        const order =
            await response.json();


        if (!response.ok) {

            paymentInfo.innerHTML = `
                <p>
                    ${order.message}
                </p>
            `;

            return;
        }


        paymentInfo.innerHTML = `

            <h2>
                Order #${order.id}
            </h2>

            <p>
                <strong>Username Roblox:</strong>
                ${escapeHTML(order.username)}
            </p>

            <p>
                <strong>Robux:</strong>
                ${order.robux} Robux
            </p>

            <p>
                <strong>Metode:</strong>
                ${escapeHTML(order.payment)}
            </p>

            <p>
                <strong>Total Pembayaran:</strong>
                Rp${Number(order.price)
                    .toLocaleString("id-ID")}
            </p>

            <p>
                <strong>Status:</strong>
                ${order.status}
            </p>

        `;


        // Simpan order untuk tracking

        localStorage.setItem(
            "lastOrderId",
            order.id
        );


        // Link tracking langsung ke order

        const trackLink =
            document.getElementById(
                "trackLink"
            );

        trackLink.href =
            `track.html?order=${order.id}`;


    } catch (error) {

        console.error(
            "Load order error:",
            error
        );


        paymentInfo.innerHTML = `
            <p>
                Server tidak bisa dihubungi.
            </p>
        `;

    }

}


// =====================
// UPLOAD BUKTI
// =====================

async function uploadProof() {

    const fileInput =
        document.getElementById(
            "proof"
        );

    const message =
        document.getElementById(
            "uploadMessage"
        );


    if (!orderId) {

        message.textContent =
            "Nomor order tidak ditemukan.";

        return;
    }


    if (!fileInput.files.length) {

        message.textContent =
            "Pilih bukti pembayaran terlebih dahulu.";

        return;
    }


    const file =
        fileInput.files[0];


    // Maksimal 5 MB

    if (file.size > 5 * 1024 * 1024) {

        message.textContent =
            "Ukuran file maksimal 5 MB.";

        return;
    }


    const formData =
        new FormData();


    formData.append(
        "proof",
        file
    );


    message.textContent =
        "Mengupload bukti pembayaran...";


    try {

        const response =
            await fetch(
                `${API_URL}/api/orders/${orderId}/proof`,
                {

                    method: "POST",

                    body: formData

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            message.textContent =
                data.message ||
                "Gagal mengupload bukti.";

            return;
        }


        message.textContent =
            "✅ Bukti pembayaran berhasil diupload!";


        fileInput.value = "";


    } catch (error) {

        console.error(
            "Upload error:",
            error
        );


        message.textContent =
            "Server tidak bisa dihubungi.";

    }

}


// =====================
// SECURITY
// =====================

function escapeHTML(text) {

    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


// =====================
// START
// =====================

loadOrder();
const API_URL = "plansstore-rbx.up.railway.app";


// =====================
// CEK PESANAN
// =====================

async function checkOrder() {

    const orderId =
        document.getElementById("orderId").value;

    const result =
        document.getElementById("result");


    if (!orderId) {

        result.innerHTML = `
            <p>
                Masukkan nomor order terlebih dahulu.
            </p>
        `;

        return;
    }


    result.innerHTML = `
        <p>
            Memuat pesanan...
        </p>
    `;


    try {

        const response =
            await fetch(
                `${API_URL}/api/orders/${orderId}`
            );


        const order =
            await response.json();


        if (!response.ok) {

            result.innerHTML = `
                <p>
                    ${order.message}
                </p>
            `;

            return;
        }


        let statusText = "";


        switch (order.status) {

            case "PENDING":

                statusText =
                    "Pesanan sedang menunggu pembayaran atau verifikasi.";

                break;


            case "PROCESSING":

                statusText =
                    "Pembayaran sudah diterima. Pesanan sedang diproses.";

                break;


            case "COMPLETED":

                statusText =
                    "Pesanan sudah selesai. Terima kasih!";

                break;


            case "CANCELLED":

                statusText =
                    "Pesanan ini telah dibatalkan.";

                break;


            default:

                statusText =
                    "Status pesanan tidak diketahui.";

        }


        result.innerHTML = `

            <div class="order-result">

                <h2>
                    Order #${order.id}
                </h2>


                <p>
                    <strong>Username:</strong>
                    ${escapeHTML(order.username)}
                </p>


                <p>
                    <strong>Robux:</strong>
                    ${order.robux} Robux
                </p>


                <p>
                    <strong>Pembayaran:</strong>
                    ${escapeHTML(order.payment)}
                </p>


                <p>
                    <strong>Total:</strong>
                    Rp${Number(order.price)
                        .toLocaleString("id-ID")}
                </p>


                <div class="order-status">

                    <strong>
                        Status: ${order.status}
                    </strong>

                    <p>
                        ${statusText}
                    </p>

                </div>

            </div>

        `;


    } catch (error) {

        console.error(
            "Track order error:",
            error
        );


        result.innerHTML = `
            <p>
                Server tidak bisa dihubungi.
            </p>
        `;

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
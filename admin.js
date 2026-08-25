const API_URL =
    "plansstore-rbx.up.railway.app";


// =====================
// LOAD ORDERS
// =====================

async function loadOrders() {

    const ordersContainer =
        document.getElementById("orders");

    const token =
        localStorage.getItem("adminToken");


    if (!token) {

        window.location.href =
            "admin-login.html";

        return;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/orders`,
                {
                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            localStorage.removeItem(
                "adminToken"
            );

            window.location.href =
                "admin-login.html";

            return;

        }


        if (!response.ok) {

            ordersContainer.innerHTML = `
                <tr>
                    <td colspan="8">
                        ${data.message ||
                        "Gagal mengambil order."}
                    </td>
                </tr>
            `;

            return;

        }


        if (data.length === 0) {

            ordersContainer.innerHTML = `
                <tr>
                    <td colspan="8">
                        Belum ada order.
                    </td>
                </tr>
            `;

            return;

        }


        ordersContainer.innerHTML =
            data.map(order => {

                const proof =
                    order.payment_proof;

                return `

                    <tr>

                        <td>
                            #${order.id}
                        </td>

                        <td>
                            ${escapeHTML(
                                order.username
                            )}
                        </td>

                        <td>
                            ${order.robux}
                        </td>

                        <td>
                            Rp${Number(
                                order.price
                            ).toLocaleString("id-ID")}
                        </td>

                        <td>
                            ${escapeHTML(
                                order.payment
                            )}
                        </td>

                        <td>

                            ${
                                proof

                                ?

                                `
                                <button
                                    onclick="viewProof('${proof}')">
                                    👁️ Lihat Bukti
                                </button>
                                `

                                :

                                `
                                <span>
                                    Belum ada
                                </span>
                                `
                            }

                        </td>

                        <td>

                            <strong>
                                ${order.status}
                            </strong>

                        </td>

                        <td>

                            <button
                                onclick="updateStatus(
                                    ${order.id},
                                    'PROCESSING'
                                )">

                                Proses

                            </button>


                            <button
                                onclick="updateStatus(
                                    ${order.id},
                                    'COMPLETED'
                                )">

                                Terima

                            </button>


                            <button
                                onclick="updateStatus(
                                    ${order.id},
                                    'CANCELLED'
                                )">

                                Tolak

                            </button>

                        </td>

                    </tr>

                `;

            }).join("");


    } catch (error) {

        console.error(error);

        ordersContainer.innerHTML = `
            <tr>
                <td colspan="8">
                    Server tidak bisa dihubungi.
                </td>
            </tr>
        `;

    }

}


// =====================
// VIEW PROOF
// =====================

function viewProof(filePath) {

    const url =
        `${API_URL}${filePath}`;

    window.open(
        url,
        "_blank"
    );

}


// =====================
// UPDATE STATUS
// =====================

async function updateStatus(
    orderId,
    status
) {

    const token =
        localStorage.getItem("adminToken");


    if (!token) {

        window.location.href =
            "admin-login.html";

        return;

    }


    const confirmation =
        confirm(
            `Ubah status order #${orderId} menjadi ${status}?`
        );


    if (!confirmation) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/orders/${orderId}/status`,
                {

                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`

                    },

                    body: JSON.stringify({
                        status: status
                    })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Gagal mengubah status."
            );

            return;

        }


        alert(
            `Order #${orderId} sekarang ${status}`
        );


        loadOrders();


    } catch (error) {

        console.error(error);

        alert(
            "Server tidak bisa dihubungi."
        );

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

loadOrders();
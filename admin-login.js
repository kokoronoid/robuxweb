async function login() {

    const username =
        document.getElementById("username").value.trim();

    const password =
        document.getElementById("password").value;

    const message =
        document.getElementById("message");


    if (!username || !password) {

        message.textContent =
            "Username dan password wajib diisi.";

        return;
    }


    try {

        const response = await fetch(
            "robuxweb-production-ccf7.up.railway.app",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    username: username,
                    password: password
                })
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            message.textContent =
                data.message || "Login gagal.";

            return;
        }


        // Simpan token login
        localStorage.setItem(
            "adminToken",
            data.token
        );


        // Masuk dashboard
        window.location.href =
            "admin.html";


    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        message.textContent =
            "Server tidak bisa dihubungi.";

    }

}
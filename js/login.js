// js/login.js
document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("loginForm");
    const inputUsuario = document.getElementById("username");
    const inputSenha = document.getElementById("senha");

    if (!form || !inputUsuario || !inputSenha) {
        console.error("Erro: campos de login não encontrados.");
        return;
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = inputUsuario.value.trim().toLowerCase();
        const senha = inputSenha.value.trim();

        if (!username || !senha) {
            alert("Informe usuário e senha.");
            return;
        }

        try {
            const { data, error } = await window.supabaseClient
                .from("usuarios")
                .select("id, username, perfil")
                .eq("username", username)
                .eq("senha", senha)
                .single();

            if (error || !data) {
                alert("Usuário ou senha inválidos.");
                return;
            }

            // Sessão
            sessionStorage.setItem("usuario_id", data.id);
            sessionStorage.setItem("username", data.username);
            sessionStorage.setItem("perfil", data.perfil);

            window.location.href = "ambientes.html";

        } catch (err) {
            console.error(err);
            alert("Erro ao conectar com o Supabase.");
        }
    });
});

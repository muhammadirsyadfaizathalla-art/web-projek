document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginMessage = document.getElementById('loginMessage');

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Sembunyikan halaman login, tampilkan dashboard
            document.getElementById('loginPage').style.display = 'none';
            document.getElementById('dashboardPage').style.display = 'block';
            document.getElementById('welcomeTitle').innerText = `Selamat Datang, ${data.user.username} (${data.user.role})`;

            // Jika role admin / superadmin, tampilkan rekap absen
            if (data.user.role === 'admin' || data.user.role === 'superadmin') {
                document.getElementById('rekapSection').style.display = 'block';
                loadAttendance();
            }
        } else {
            loginMessage.innerText = data.message || 'Login gagal!';
        }
    } catch (err) {
        loginMessage.innerText = 'Terjadi kesalahan pada server.';
    }
});

// Fungsi ambil data absensi untuk admin
async function loadAttendance() {
    try {
        const response = await fetch('/api/attendance');
        const data = await response.json();
        
        const list = document.getElementById('attendanceList');
        list.innerHTML = '';
        
        data.forEach(item => {
            const li = document.createElement('li');
            li.innerText = `${item.name} - ${item.status} (${new Date(item.created_at).toLocaleString()})`;
            list.appendChild(li);
        });
    } catch (err) {
        console.error('Gagal memuat data absensi:', err);
    }
}

// Fungsi Kirim Absen (Disesuaikan dengan ID di index.html: 'namaUser' & 'statusAbsen')
document.getElementById('attendanceForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('namaUser').value;
    const status = document.getElementById('statusAbsen').value;
    const absenMessage = document.getElementById('absenMessage');

    try {
        const response = await fetch('/api/attendance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, status })
        });

        const result = await response.json();

        if (response.ok) {
            if (absenMessage) {
                absenMessage.style.color = 'green';
                absenMessage.innerText = 'Absen berhasil dikirim!';
            } else {
                alert('Absen berhasil dikirim!');
            }
            document.getElementById('attendanceForm').reset();
        } else {
            if (absenMessage) {
                absenMessage.style.color = 'red';
                absenMessage.innerText = result.message || 'Gagal mengirim absen.';
            } else {
                alert('Gagal: ' + result.message);
            }
        }
    } catch (err) {
        console.error('Error:', err);
        if (absenMessage) {
            absenMessage.style.color = 'red';
            absenMessage.innerText = 'Terjadi kesalahan pada server.';
        } else {
            alert('Terjadi kesalahan pada server.');
        }
    }
});

// Tombol Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    location.reload();
});
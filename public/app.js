// Variabel global untuk menyimpan data user yang sedang login
let currentUser = null;

// Proses Login
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
            currentUser = data.user; // Simpan data user aktif

            // Sembunyikan halaman login, tampilkan dashboard
            document.getElementById('loginPage').style.display = 'none';
            document.getElementById('dashboardPage').style.display = 'block';
            document.getElementById('welcomeTitle').innerText = `Selamat Datang, ${currentUser.username} (${currentUser.role})`;

            // Jika role admin / superadmin, tampilkan rekap absen
            if (currentUser.role === 'admin' || currentUser.role === 'superadmin') {
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

// Fungsi Ambil dan Tampilkan Data Absensi (Dilengkapi Tombol Edit & Hapus untuk Admin/Superadmin)
async function loadAttendance() {
    try {
        const response = await fetch('/api/attendance');
        const data = await response.json();
        
        const list = document.getElementById('attendanceList');
        list.innerHTML = '';
        
        data.forEach(item => {
            const li = document.createElement('li');
            li.style.margin = '10px 0';
            li.style.padding = '5px';
            li.style.borderBottom = '1px solid #ddd';

            let actionButtons = '';
            // Tampilkan tombol Edit & Hapus hanya jika yang login adalah admin/superadmin
            if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'superadmin')) {
                actionButtons = `
                    <button onclick="editAbsen(${item.id}, '${item.name}', '${item.status}')" style="margin-left: 10px; background: #f39c12; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">Edit</button>
                    <button onclick="deleteAbsen(${item.id})" style="margin-left: 5px; background: #e74c3c; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">Hapus</button>
                `;
            }

            li.innerHTML = `
                <span><b>${item.name}</b> — Status: <b>${item.status}</b> <i style="color: gray; font-size: 0.9em;">(${new Date(item.created_at).toLocaleString()})</i></span>
                ${actionButtons}
            `;
            list.appendChild(li);
        });
    } catch (err) {
        console.error('Gagal memuat data absensi:', err);
    }
}

// Fungsi Edit Absen
async function editAbsen(id, currentName, currentStatus) {
    const newName = prompt("Ubah Nama:", currentName);
    if (newName === null) return; // Batal jika pencet cancel

    const newStatus = prompt("Ubah Status (Hadir / Izin / Sakit):", currentStatus);
    if (newStatus === null) return;

    try {
        const response = await fetch(`/api/attendance/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newName, status: newStatus })
        });

        const result = await response.json();
        if (response.ok) {
            alert(result.message);
            loadAttendance(); // Refresh tabel rekap
        } else {
            alert('Gagal mengedit: ' + result.message);
        }
    } catch (err) {
        console.error('Error:', err);
        alert('Terjadi kesalahan jaringan.');
    }
}

// Fungsi Hapus Absen
async function deleteAbsen(id) {
    if (!confirm("Yakin ingin menghapus data absensi ini?")) return;

    try {
        const response = await fetch(`/api/attendance/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();
        if (response.ok) {
            alert(result.message);
            loadAttendance(); // Refresh tabel rekap
        } else {
            alert('Gagal menghapus: ' + result.message);
        }
    } catch (err) {
        console.error('Error:', err);
        alert('Terjadi kesalahan jaringan.');
    }
}

// Fungsi Kirim Absen (User biasa)
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
            
            // Jika yang ngisi kebetulan admin/superadmin, langsung update juga daftar rekapnya
            if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'superadmin')) {
                loadAttendance();
            }
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
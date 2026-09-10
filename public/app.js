const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Konfigurasi Supabase dari environment variable (.env)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 1. Endpoint Login (Contoh sederhana role-based)
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // Sesuaikan data akun login sesuai kebutuhan project lu
  if (username === 'superadmin' && password === 'admin123') {
    return res.json({ user: { username, role: 'superadmin' } });
  } else if (username === 'admin' && password === 'admin123') {
    return res.json({ user: { username, role: 'admin' } });
  } else if (username === 'siswa' && password === 'siswa123') {
    return res.json({ user: { username, role: 'user' } });
  }

  res.status(401).json({ message: 'Username atau password salah!' });
});

// 2. Endpoint Ambil Data Absensi (Untuk Admin/Super Admin)
app.get('/api/attendance', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('absensi')
      .select('*')
      .order('id', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. Endpoint Kirim Absen (Menyimpan data ke Supabase)
app.post('/api/attendance', async (req, res) => {
  try {
    const { name, status } = req.body;

    if (!name || !status) {
      return res.status(400).json({ message: 'Nama dan status wajib diisi!' });
    }

    const { data, error } = await supabase
      .from('absensi')
      .insert([{ name, status }]);

    if (error) throw error;
    res.json({ message: 'Absen berhasil dikirim!', data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. Endpoint Hapus Absen (Khusus Super Admin)
app.delete('/api/attendance/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('absensi')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Data absen berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
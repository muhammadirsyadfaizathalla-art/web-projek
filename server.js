const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Konfigurasi koneksi ke Supabase menggunakan Environment Variables Vercel
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 1. Endpoint Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Cek user di Supabase
    let { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('password', password);

    if (error) throw error;

    let user = users && users.length > 0 ? users[0] : null;

    // Jika user belum ada, daftarkan otomatis sesuai role
    if (!user) {
      let role = 'user';
      if (username.toLowerCase() === 'superadmin') role = 'superadmin';
      else if (username.toLowerCase() === 'admin') role = 'admin';

      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([{ username, password, role }])
        .select()
        .single();

      if (insertError) throw insertError;
      user = newUser;
    }

    res.json({ success: true, message: 'Login berhasil', user });
  } catch (err) {
    console.error('Login Error:', err.message);
    res.status(400).json({ success: false, message: 'Username atau password salah!' });
  }
});

// 2. Endpoint Ambil Data Absensi dari Supabase
app.get('/api/attendance', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('absensi')
      .select('*')
      .order('id', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Get Attendance Error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. Endpoint Kirim Absen Baru ke Supabase
app.post('/api/attendance', async (req, res) => {
  const { name, status } = req.body;

  if (!name || !status) {
    return res.status(400).json({ success: false, message: 'Nama dan status wajib diisi!' });
  }

  const dateStr = new Date().toISOString().slice(0, 10);

  try {
    const { data, error } = await supabase
      .from('absensi')
      .insert([{ name, status, created_at: dateStr }])
      .select();

    if (error) throw error;
    res.json({ success: true, message: 'Absen berhasil dikirim!', data });
  } catch (err) {
    console.error('Insert Attendance Error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. Endpoint Hapus Absen (Khusus Super Admin)
app.delete('/api/attendance/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from('absensi')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: 'Data absen berhasil dihapus' });
  } catch (err) {
    console.error('Delete Error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Jalankan server lokal hanya jika tidak di Vercel
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
}

// Ekspor app untuk Vercel
module.exports = app;
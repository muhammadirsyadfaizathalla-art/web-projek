const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Konfigurasi Supabase (Ganti dengan URL & Anon Key lu jika belum pakai env)
const supabaseUrl = process.env.SUPABASE_URL || 'https://tdloqfhsoijlvqxmtdfv.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkbG9xZmhzb2lqbHZxeG10ZGZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MjAxOTUsImV4cCI6MjA4NjQ5NjE5NX0.O1-u6H_4x2d7B3x1...' // Pastikan key asli lu aman atau pakai env
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single();

    if (error || !data) {
        return res.status(401).json({ message: 'Username atau password salah!' });
    }

    res.json({ message: 'Login berhasil', user: data });
});

// API Ambil Data Absensi
app.get('/api/attendance', async (req, res) => {
    const { data, error } = await supabase
        .from('absensi')
        .select('*')
        .order('id', { ascending: false });

    if (error) return res.status(500).json({ message: error.message });
    res.json(data);
});

// API Kirim Absen
app.post('/api/attendance', async (req, res) => {
    const { name, status } = req.body;

    const { data, error } = await supabase
        .from('absensi')
        .insert([{ name, status }]);

    if (error) return res.status(400).json({ message: error.message });
    res.json({ message: 'Absen berhasil dikirim!' });
});

// API Edit Absensi (Khusus Super Admin/Admin)
app.put('/api/attendance/:id', async (req, res) => {
    const { id } = req.params;
    const { name, status } = req.body;

    const { data, error } = await supabase
        .from('absensi')
        .update({ name, status })
        .eq('id', id);

    if (error) return res.status(400).json({ message: error.message });
    res.json({ message: 'Data absensi berhasil diperbarui!' });
});

// API Hapus Absensi (Khusus Super Admin/Admin)
app.delete('/api/attendance/:id', async (req, res) => {
    const { id } = req.params;

    const { data, error } = await supabase
        .from('absensi')
        .delete()
        .eq('id', id);

    if (error) return res.status(400).json({ message: error.message });
    res.json({ message: 'Data absensi berhasil dihapus!' });
});

app.listen(port, () => {
    console.log(`Server berjalan di port ${port}`);
});
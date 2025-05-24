document.addEventListener('DOMContentLoaded', async () => {
  // Configuration Supabase
  const supabaseUrl = 'https://ruejiywyrbnlflzyacou.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1ZWppeXd5cmJubGZsenlhY291Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2ODI1NDEsImV4cCI6MjA2MzI1ODU0MX0.MaMVpNzCWdiBufFzhd6RL4riLQQejTUG4FWd5cuHUd8';

  // Initialisation du client Supabase
  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

  // Fonction pour charger les kilométrages
  async function loadKilometrages() {
    try {
      const { data, error } = await supabase
        .from('kilometrage')
        .select('id, date, kilometres')
        .order('date', { ascending: false });

      if (error) throw error;

      const tbody = document.getElementById('table-kilometrages');
      tbody.innerHTML = '';

      data.forEach(record => {
        const row = document.createElement('tr');

        const idCell = document.createElement('td');
        idCell.className = 'hidden';
        idCell.textContent = record.id;

        const dateCell = document.createElement('td');
        const formattedDate = new Date(record.date).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
        dateCell.textContent = formattedDate;

        const kmCell = document.createElement('td');
        kmCell.textContent = new Intl.NumberFormat('fr-FR').format(record.kilometres);

        row.append(idCell, dateCell, kmCell);
        tbody.appendChild(row);
      });

    } catch (error) {
      console.error('Erreur de chargement:', error);
    }
  }

  // ✅ Appel initial
  await loadKilometrages();
});

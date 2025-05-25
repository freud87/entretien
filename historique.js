document.addEventListener('DOMContentLoaded', async () => {
  // Configuration Supabase
  const supabaseUrl = 'https://ruejiywyrbnlflzyacou.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1ZWppeXd5cmJubGZsenlhY291Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2ODI1NDEsImV4cCI6MjA2MzI1ODU0MX0.MaMVpNzCWdiBufFzhd6RL4riLQQejTUG4FWd5cuHUd8';
  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

  async function chargerKilometrages() {
    try {
      const { data, error } = await supabase
        .from('historique')
        .select('id, date, kilometrage, intervention')
        .order('date', { ascending: false });

      if (error) throw error;

      const tbody = document.getElementById('table-historique');
      tbody.innerHTML = '';

      data.forEach((item) => {
        const row = document.createElement('tr');

        // Colonne ID (masquée)
        const tdId = document.createElement('td');
        tdId.textContent = item.id;
        tdId.classList.add('hidden');

        // Colonne Date
        const tdDate = document.createElement('td');
        const dateObj = new Date(item.date);
        tdDate.textContent = dateObj.toLocaleDateString('fr-FR');

        // Colonne Kilométrage
        const tdKm = document.createElement('td');
        tdKm.textContent = new Intl.NumberFormat('fr-FR').format(item.kilometrage);

        // Colonne Intervention
        const tdIntervention = document.createElement('td');
        tdIntervention.textContent = item.intervention;

        // Colonne Remarque (vide au départ, remplie plus tard)
        const tdRemarque = document.createElement('td');
        tdRemarque.textContent = ''; // vide pour être rempli ensuite

        // Ajouter les cellules à la ligne
        row.appendChild(tdId);
        row.appendChild(tdDate);
        row.appendChild(tdKm);
        row.appendChild(tdIntervention);
        row.appendChild(tdRemarque);

        // Ajouter la ligne au tableau
        tbody.appendChild(row);
      });

      // Calculer les remarques une fois le tableau rempli
      calculerPeriodes();

    } catch (error) {
      console.error('Erreur chargement kilométrages :', error);
    }
  }

  await chargerKilometrages();
});

function calculerPeriodes() {
  const rows = Array.from(document.querySelectorAll("#table-historique tr"));
  const interventionMap = {}; // contiendra l'intervention la plus récente déjà rencontrée

  for (let i = rows.length - 1; i >= 0; i--) {
    const row = rows[i];
    const cells = row.cells;
    if (cells.length < 5) continue;

    const dateStr = cells[1].textContent.trim();  // DATE
    const kmStr = cells[2].textContent.trim().replace(/\s/g, '') || "0";
    const intervention = cells[3].textContent.trim();
    const remarqueCell = cells[4];

    const date = new Date(dateStr.split('/').reverse().join('-'));
    const km = parseInt(kmStr);

    if (interventionMap[intervention]) {
      const next = interventionMap[intervention];

      const diffYears = date.getFullYear() - next.date.getFullYear();
      const diffMonths = diffYears * 12 + (next.date.getMonth() - date.getMonth());
      const diffKm = Math.abs(next.km - km);

      remarqueCell.textContent = `${diffMonths} mois, ${diffKm.toLocaleString()} km depuis la dernière`;
    }

    // Enregistrer l'intervention comme la plus ancienne vue jusqu'ici
    interventionMap[intervention] = { date, km };
  }
}

const supabaseUrl = 'https://ruejiywyrbnlflzyacou.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1ZWppeXd5cmJubGZsenlhY291Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2ODI1NDEsImV4cCI6MjA2MzI1ODU0MX0.MaMVpNzCWdiBufFzhd6RL4riLQQejTUG4FWd5cuHUd8';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

async function chargerPlan() {
  try {
    const { data, error } = await supabase
      .from('plan')
      .select('id, intervention, cycle_km, cycle_mois');

    if (error) throw error;

    const tbody = document.getElementById('table-plan');
    if (!tbody) {
      console.warn("Élément #table-plan introuvable.");
      return;
    }

    tbody.innerHTML = ''; // Vider le tableau avant de remplir

    data.forEach(record => {
      const row = document.createElement('tr');

      // Colonne masquée : ID
      const idCell = document.createElement('td');
      idCell.className = 'hidden'; // Masquée via CSS
      idCell.textContent = record.id;

      // Intervention
      const interventionCell = document.createElement('td');
      interventionCell.textContent = record.intervention;

      // Cycle km
      const kmCell = document.createElement('td');
      kmCell.textContent = new Intl.NumberFormat('fr-FR').format(record.cycle_km);

      // Cycle mois
      const moisCell = document.createElement('td');
      moisCell.textContent = record.cycle_mois;

      row.append(idCell, interventionCell, kmCell, moisCell);
      tbody.appendChild(row);
    });

  } catch (err) {
    console.error('Erreur JS lors du chargement du plan :', err);
  }
}

document.addEventListener('DOMContentLoaded', chargerPlan);

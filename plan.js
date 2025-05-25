// plan.js — version compatible avec <script src="supabase-js"> déjà chargée

const supabaseUrl = 'https://ruejiywyrbnlflzyacou.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1ZWppeXd5cmJubGZsenlhY291Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2ODI1NDEsImV4cCI6MjA2MzI1ODU0MX0.MaMVpNzCWdiBufFzhd6RL4riLQQejTUG4FWd5cuHUd8';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

async function chargerPlan() {
  try {
    const { data, error } = await supabase
      .from('plan')
      .select('id, intervention, cycle_km, cycle_mois');

    if (error) {
      console.error('Erreur de récupération des données :', error.message);
      return;
    }

    const tbody = document.getElementById('table-plan');
    if (!tbody) {
      console.warn("Élément #table-plan introuvable.");
      return;
    }

    tbody.innerHTML = ''; // Vider le tableau avant de remplir

    data.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row.id}</td>
        <td>${row.intervention}</td>
        <td>${row.cycle_km}</td>
        <td>${row.cycle_mois}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Erreur JS lors du chargement du plan :', err);
  }
}

document.addEventListener('DOMContentLoaded', chargerPlan);


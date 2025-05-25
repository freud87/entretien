// plan.js — version compatible avec <script src="supabase-js"> déjà chargée

const supabaseUrl = 'https://ruejiywyrbnlflzyacou.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // tronqué ici
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

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

    tbody.innerHTML = ''; // Réinitialiser le tableau

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
    console.error('Erreur lors du chargement du plan :', err);
  }
}

document.addEventListener('DOMContentLoaded', chargerPlan);


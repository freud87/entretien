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
function remplirTableau(historique) {
  // Dictionnaire pour stocker la dernière occurrence de chaque type d'intervention
  const dernieresInterventions = {};

  // Récupère le corps du tableau HTML
  const tbody = document.getElementById("table-historique");
  tbody.innerHTML = ""; // Vide le contenu existant

  historique.forEach(entry => {
    const { id, date, kilometrage, intervention } = entry;

    // Création d'une ligne de tableau
    const tr = document.createElement("tr");

    // Conversion de la date en objet Date JS
    const dateObj = new Date(date.split("/").reverse().join("-")); // gère JJ/MM/YYYY

    // Initialiser la remarque
    let remarque = "";

    if (dernieresInterventions[intervention]) {
      const derniere = dernieresInterventions[intervention];
      const derniereDateObj = new Date(derniere.date.split("/").reverse().join("-"));
      const diffMois = Math.round((dateObj - derniereDateObj) / (1000 * 60 * 60 * 24 * 30.44));
      const diffKm = kilometrage !== 0 && derniere.kilometrage !== 0 ? kilometrage - derniere.kilometrage : null;

      if (diffKm !== null) {
        remarque += `${diffKm} km et `;
      }
      remarque += `${diffMois} mois`;
    } else {
      remarque = "Aucune donnée";
    }

    // Mise à jour du dernier passage
    dernieresInterventions[intervention] = { date, kilometrage };

    // Remplissage des cellules
    tr.innerHTML = `
      <td class="hidden">${id}</td>
      <td>${date}</td>
      <td>${kilometrage !== 0 ? kilometrage.toLocaleString() : "-"}</td>
      <td>${intervention}</td>
      <td>${remarque}</td>
    `;

    tbody.appendChild(tr);
  });
}

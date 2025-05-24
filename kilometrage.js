document.addEventListener('DOMContentLoaded', async () => {
  // Initialisation Supabase
  const supabaseUrl = 'https://ruejiywyrbnlflzyacou.supabase.co ';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1ZWppeXd5cmJubGZsenlhY291Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2ODI1NDEsImV4cCI6MjA2MzI1ODU0MX0.MaMVpNzCWdiBufFzhd6RL4riLQQejTUG4FWd5cuHUd8';
  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

  const tbody = document.getElementById('table-kilometrages');
  const btnAddKm = document.getElementById('btn-add-km');
  const btnSaveKm = document.getElementById('btn-save-km');
  const btnCancelKm = document.getElementById('btn-cncl-km');
  const btnKm = document.getElementById('btn-km');

  // --- Fonction : Charger les kilométrages ---
  async function loadKilometrages() {
    try {
      const { data, error } = await supabase
        .from('kilometrage')
        .select('id, date, kilometrage')
        .order('date', { ascending: false });

      if (error) throw error;

      tbody.innerHTML = '';
      data.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td class="hidden">${record.id}</td>
          <td>${new Date(record.date).toLocaleDateString('fr-FR')}</td>
          <td style="text-align:right;">${new Intl.NumberFormat('fr-FR').format(record.kilometrage)}</td>
        `;
        tbody.appendChild(row);
      });
    } catch (err) {
      console.error('Erreur chargement:', err);
    }
  }

  // --- Événements ---

  // Ajouter une ligne temporaire
  btnAddKm.addEventListener('click', () => {
    if (document.getElementById('new-km-row')) return;
    
    const newRow = document.createElement('tr');
    newRow.id = 'new-km-row';
    newRow.style.backgroundColor = '#fff8e1';

    newRow.innerHTML = `
      <td class="hidden">-</td>
      <td><input type="text" id="new-date" placeholder="jj/mm/aaaa" style="width:100%; padding:4px;"></td>
      <td><input type="number" id="new-km" placeholder="km" style="width:100%; padding:4px;"></td>
    `;

    tbody.insertBefore(newRow, tbody.firstChild);
    btnKm.style.display = 'inline';
  });

  // Sauvegarder dans Supabase
  btnSaveKm.addEventListener('click', async () => {
    const dateInput = document.getElementById('new-date').value.trim();
    const kmInput = parseInt(document.getElementById('new-km').value.trim());

    if (!dateInput || isNaN(kmInput)) {
      alert("Veuillez remplir tous les champs correctement.");
      return;
    }

    const [jj, mm, aaaa] = dateInput.split('/');
    if (jj.length !== 2 || mm.length !== 2 || aaaa.length !== 4) {
      alert("Format de date invalide. Utilisez jj/mm/aaaa.");
      return;
    }

    const formattedDate = `${aaaa}-${mm}-${jj}`;
    const { error } = await supabase.from('kilometrage').insert({ date: formattedDate, kilometrage: kmInput });

    if (error) {
      console.error('Erreur Supabase:', error);
      alert("Erreur lors de l'ajout.");
      return;
    }

    // Rafraîchir + Nettoyer UI
    document.getElementById('new-km-row')?.remove();
    btnKm.style.display = 'none';
    await loadKilometrages();
  });

  // Annuler l’ajout
  btnCancelKm.addEventListener('click', () => {
    document.getElementById('new-km-row')?.remove();
    btnKm.style.display = 'none';
  });

  // Chargement initial
  await loadKilometrages();
});

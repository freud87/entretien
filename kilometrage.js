
document.addEventListener('DOMContentLoaded', async () => {
  // Configuration Supabase
  const supabaseUrl = 'https://ruejiywyrbnlflzyacou.supabase.co';
   const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1ZWppeXd5cmJubGZsenlhY291Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2ODI1NDEsImV4cCI6MjA2MzI1ODU0MX0.MaMVpNzCWdiBufFzhd6RL4riLQQejTUG4FWd5cuHUd8';
  // Initialisation du client Supabase
  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

  // Chargement des kilométrages
  async function loadKilometrages() {
    try {
      const { data, error } = await supabase
        .from('kilometrage')
        .select('id, date, kilometrage')
        .order('date', { ascending: false });
      if (error) throw error;

      const tbody = document.getElementById('table-kilometrages');
      tbody.innerHTML = '';

      data.forEach(record => {
        const row = document.createElement('tr');

        // ID caché
        const idCell = document.createElement('td');
        idCell.className = 'hidden';
        idCell.textContent = record.id;

        // Date affichée
        const dateCell = document.createElement('td');
        const formattedDate = new Date(record.date).toLocaleDateString('fr-FR');
        dateCell.textContent = formattedDate;

        // Kilométrage éditable
        const kmCell = document.createElement('td');
        kmCell.contentEditable = true;
        kmCell.textContent = record.kilometrage;

        kmCell.addEventListener('blur', async () => {
          const newValue = parseInt(kmCell.textContent.replace(/\s/g, ''));
          if (isNaN(newValue) || newValue === record.kilometrage) return;

          const { error } = await supabase
            .from('kilometrage')
            .update({ kilometrage: newValue })
            .eq('id', record.id);

          if (error) {
            alert("Erreur de mise à jour !");
            console.error(error);
            kmCell.textContent = record.kilometrage;
          } else {
            kmCell.textContent = new Intl.NumberFormat('fr-FR').format(newValue);
          }
        });

        row.append(idCell, dateCell, kmCell);
        tbody.appendChild(row);
      });

    } catch (error) {
      console.error('Erreur de chargement :', error);
    }
  }

  // Appel initial
  await loadKilometrages();

  // Sélecteurs
  const btnAddKm = document.getElementById('btn-add-km');
  const btnSaveKm = document.getElementById('btn-save-km');
  const btnCancelKm = document.getElementById('btn-cncl-km');
  const tbodyKm = document.getElementById('table-kilometrages');
  const btnKm = document.getElementById('btn-km');

  // Gestion du bouton Ajouter
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

    tbodyKm.insertBefore(newRow, tbodyKm.firstChild);
    btnKm.style.display = 'inline';
  });

  // Gestion du bouton Annuler
  btnCancelKm.addEventListener('click', () => {
    const newRow = document.getElementById('new-km-row');
    if (newRow) newRow.remove();

    document.getElementById('new-date')?.value = '';
    document.getElementById('new-km')?.value = '';
    btnKm.style.display = 'none';
  });

  // Gestion du bouton Enregistrer
  btnSaveKm.addEventListener('click', async () => {
    const dateStr = document.getElementById('new-date')?.value.trim();
    const kmStr = document.getElementById('new-km')?.value.trim();

    if (!dateStr || !kmStr) {
      alert('Veuillez remplir la date et le kilométrage.');
      return;
    }

    const parts = dateStr.split('/');
    if (parts.length !== 3) {
      alert('Format de date incorrect. Utilisez jj/mm/aaaa.');
      return;
    }

    const [jj, mm, aaaa] = parts;
    const formattedDate = `${aaaa}-${mm}-${jj}`;
    const kilometrage = parseInt(kmStr);

    if (isNaN(kilometrage)) {
      alert('Kilométrage invalide.');
      return;
    }

    const { error } = await supabase
      .from('kilometrage')
      .insert({ date: formattedDate, kilometrage });

    if (error) {
      alert("Erreur lors de l'ajout.");
      console.error('Erreur Supabase :', error);
      return;
    }

    document.getElementById('new-km-row')?.remove();
    btnKm.style.display = 'none';
    await loadKilometrages();
  });

});

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
      .select('id, date, kilometrage')
      .order('date', { ascending: false });

    if (error) throw error;

    const tbody = document.getElementById('table-kilometrages');
    tbody.innerHTML = '';

    if (!data || data.length === 0) return;

    // Affichage dans le tableau
    data.forEach(record => {
      const row = document.createElement('tr');

      const idCell = document.createElement('td');
      idCell.className = 'hidden';
      idCell.textContent = record.id;

      const dateCell = document.createElement('td');
      const dateObj = new Date(record.date);
      const formattedDate = dateObj.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      dateCell.textContent = formattedDate;

      const kmCell = document.createElement('td');
      kmCell.textContent = record.kilometrage;
      row.append(idCell, dateCell, kmCell);
      tbody.appendChild(row);
    });

    // === Calcul de la moyenne par mois ===
    if (data.length >= 2) {
      // Tri croissant (plus ancienne → plus récente)
      const sorted = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));

      const dateDebut = new Date(sorted[0].date);
      const dateFin = new Date(sorted[sorted.length - 1].date);
      const kmDebut = sorted[0].kilometrage;
      const kmFin = sorted[sorted.length - 1].kilometrage;

      const ecartKm = kmFin - kmDebut;

      const moisDebut = dateDebut.getFullYear() * 12 + dateDebut.getMonth();
      const moisFin = dateFin.getFullYear() * 12 + dateFin.getMonth();
      const ecartMois = moisFin - moisDebut + (dateFin.getDate() - dateDebut.getDate()) / 30;

      const moyenneMensuelle = ecartMois > 0 ? Math.round(ecartKm / ecartMois) : 0;

      const spanMoyenne = document.getElementById('moyenne');
      if (spanMoyenne) {
        spanMoyenne.textContent = `${moyenneMensuelle.toLocaleString('fr-FR')}`;
      }
    }

  } catch (error) {
    console.error('Erreur de chargement:', error);
  }
}



  // ✅ Appel initial
  await loadKilometrages();
const btnAddKm = document.getElementById('btn-add-km');
const btnKm = document.getElementById('btn-km');
const btnSaveKm = document.getElementById('btn-save-km');
const tbodyKm = document.getElementById('table-kilometrages');
// Sélection du bouton Annuler
const btnCancelKm = document.getElementById('btn-cncl-km');
// Gestion du clic sur Annuler
btnCancelKm.addEventListener('click', () => {
  // Supprime la ligne temporaire si elle existe
  const newRow = document.getElementById('new-km-row');
  if (newRow) {
    newRow.remove();
  }

  // Optionnel : masquer ou réinitialiser les champs
  const inputDate = document.getElementById('new-date');
  const inputKm = document.getElementById('new-km');
  if (inputDate) inputDate.value = '';
  if (inputKm) inputKm.value = '';

  // Remettre le bouton "+" visible/actif
  ////const btnKm = document.getElementById('btn-km'); // ou 'btn-add-km' selon ton HTML
  //if (btnKm) btnKm.style.display = 'inline';
  btnKm.style.display = 'none';
});
  
// Gestion du clic sur +
btnAddKm.addEventListener('click', () => {
  // Empêche l’ajout de plusieurs lignes
  if (document.getElementById('new-km-row')) return;

  const newRow = document.createElement('tr');
  newRow.id = 'new-km-row';
  newRow.style.backgroundColor = '#fff8e1'; // Couleur différente pour édition

  newRow.innerHTML = `
    <td class="hidden">-</td>
    <td><input type="text" id="new-date" placeholder="jj/mm/aaaa" style="width:100%; padding:4px;"></td>
    <td><input type="number" id="new-km" placeholder="km" style="width:100%; padding:4px;"></td>
  `;

  tbodyKm.insertBefore(newRow, tbodyKm.firstChild);
  btnKm.style.display = 'inline';
});

// Gestion du clic sur 💾
btnSaveKm.addEventListener('click', async () => {
  const dateStr = document.getElementById('new-date').value;
  const kmStr = document.getElementById('new-km').value;

  if (!dateStr || !kmStr) {
    alert('Veuillez remplir la date et le kilométrage.');
    return;
  }

  // Conversion jj/mm/aaaa → aaaa-mm-jj
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

  // Envoi vers Supabase
  const { error } = await supabase.from('kilometrage').insert({ date: formattedDate, kilometrage });

  if (error) {
    console.error('Erreur Supabase :', error);
    alert("Erreur lors de l'ajout.");
    return;
  }

  // Nettoyage UI
  document.getElementById('new-km-row')?.remove();
  btnKm.style.display = 'none';
  await loadKilometrages();
});


});
